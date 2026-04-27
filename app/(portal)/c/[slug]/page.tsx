import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/posts/PostCard'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import type { Post, Category } from '@/types'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase  = await createClient()
  const { data: cat } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single()

  return cat
    ? { title: `${cat.name} – El Coreano`, description: cat.description }
    : { title: 'El Coreano' }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug }              = await params
  const { sort = 'reciente' } = await searchParams
  const supabase              = await createClient()

  const [{ data: category }, { data: { user } }] = await Promise.all([
    supabase.from('categories').select('*').eq('slug', slug).single(),
    supabase.auth.getUser(),
  ])

  if (!category) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(id, username, avatar_url), categories(id, name, slug, icon)')
    .eq('category_id', category.id)
    .eq('is_deleted', false)
    .order(sort === 'popular' ? 'upvotes' : 'created_at', { ascending: false })
    .limit(50)

  let votedPostIds = new Set<string>()
  if (user) {
    const { data: votes } = await supabase
      .from('post_votes')
      .select('post_id')
      .eq('user_id', user.id)
    votedPostIds = new Set(votes?.map(v => v.post_id) ?? [])
  }

  const enriched: Post[] = (posts ?? []).map(p => ({
    ...p,
    user_vote: votedPostIds.has(p.id) ? 1 : null,
  }))

  return (
    <div className="space-y-3">
      {/* 카테고리 헤더 */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>{(category as Category).icon}</span>
              {(category as Category).name}
            </h1>
            {(category as Category).description && (
              <p className="text-sm text-gray-500 mt-1">{(category as Category).description}</p>
            )}
          </div>
          <Link
            href={user ? `/c/${slug}/submit` : '/login'}
            className="flex items-center gap-1.5 bg-k-red text-white text-sm font-medium px-3 py-1.5 rounded hover:bg-k-red-dark transition-colors flex-shrink-0"
          >
            <PlusCircle size={14} />
            Publicar
          </Link>
        </div>
      </div>

      {/* 정렬 탭 */}
      <div className="flex gap-1 bg-white rounded border border-gray-200 p-1 w-fit">
        {[{ label: 'Reciente', value: 'reciente' }, { label: 'Popular', value: 'popular' }].map(tab => (
          <a
            key={tab.value}
            href={`/c/${slug}?sort=${tab.value}`}
            className={`px-4 py-1.5 text-sm rounded font-medium transition-colors ${
              sort === tab.value ? 'bg-k-red text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* 글 목록 */}
      {enriched.length === 0 ? (
        <div className="bg-white rounded border border-gray-200 p-8 text-center">
          <p className="text-4xl mb-2">🌱</p>
          <p className="text-gray-500 mb-3">Aún no hay publicaciones en esta categoría.</p>
          <Link
            href={user ? `/c/${slug}/submit` : '/login'}
            className="inline-flex items-center gap-1.5 bg-k-red text-white text-sm font-medium px-4 py-2 rounded hover:bg-k-red-dark"
          >
            <PlusCircle size={14} />
            Crear la primera publicación
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {enriched.map(post => (
            <PostCard key={post.id} post={post} userId={user?.id ?? null} />
          ))}
        </div>
      )}
    </div>
  )
}
