import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CategoryPostList } from '@/components/posts/CategoryPostList'
import type { Metadata } from 'next'
import type { Post, Category } from '@/types'

export const revalidate = 60

const PAGE_SIZE = 20

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; page?: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase  = await createClient()
  const { data: cat } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!cat) return { title: 'El Coreano' }

  return {
    title: cat.name,
    description: cat.description ?? undefined,
    openGraph: {
      title: `${cat.name} – El Coreano`,
      description: cat.description ?? undefined,
      siteName: 'El Coreano',
      type: 'website',
    },
    twitter: { card: 'summary', title: `${cat.name} – El Coreano`, description: cat.description ?? undefined },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug }                                    = await params
  const { sort = 'reciente', page: pageParam = '1' } = await searchParams
  const page                                        = Math.max(1, parseInt(pageParam, 10) || 1)
  const supabase                                    = await createClient()

  const [{ data: category }, { data: { user } }] = await Promise.all([
    supabase.from('categories').select('*').eq('slug', slug).single(),
    supabase.auth.getUser(),
  ])

  if (!category) notFound()

  const start = (page - 1) * PAGE_SIZE
  const end   = start + PAGE_SIZE - 1

  const { data: posts, count } = await supabase
    .from('posts')
    .select('*, profiles(id, username, avatar_url), categories(id, name, slug, icon)', { count: 'exact' })
    .eq('category_id', category.id)
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order(sort === 'popular' ? 'upvotes' : 'created_at', { ascending: false })
    .range(start, end)

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

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <CategoryPostList
      category={category as Category}
      posts={enriched}
      slug={slug}
      userId={user?.id ?? null}
      currentPage={page}
      totalPages={totalPages}
      sort={sort}
      paginationBase={`/c/${slug}`}
    />
  )
}
