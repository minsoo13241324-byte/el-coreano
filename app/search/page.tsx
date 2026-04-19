import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/posts/PostCard'
import { Sidebar } from '@/components/layout/Sidebar'
import type { Post, Category } from '@/types'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' }  = await searchParams
  const query        = q.trim()
  const supabase     = await createClient()

  const [{ data: { user } }, { data: categories }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('categories').select('*').order('name'),
  ])

  let posts: Post[] = []
  if (query.length >= 2) {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(id, username), categories(id, name, slug, icon)')
      .eq('is_deleted', false)
      .ilike('title', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(40)

    let votedPostIds = new Set<string>()
    if (user) {
      const { data: votes } = await supabase
        .from('post_votes')
        .select('post_id')
        .eq('user_id', user.id)
      votedPostIds = new Set(votes?.map(v => v.post_id) ?? [])
    }

    posts = (data ?? []).map(p => ({
      ...p,
      user_vote: votedPostIds.has(p.id) ? 1 : null,
    }))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
      <section>
        <form action="/search" className="mb-5">
          <div className="flex gap-2">
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Buscar publicaciones…"
              className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-k-red"
              autoFocus
            />
            <button
              type="submit"
              className="bg-k-red text-white px-4 py-2 text-sm font-medium rounded hover:bg-k-red-dark transition-colors"
            >
              Buscar
            </button>
          </div>
        </form>

        {query.length >= 2 ? (
          <>
            <p className="text-sm text-gray-500 mb-3">
              {posts.length === 0
                ? `Sin resultados para "${query}"`
                : `${posts.length} resultado${posts.length !== 1 ? 's' : ''} para "${query}"`}
            </p>
            {posts.length > 0 && (
              <div className="space-y-3">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} userId={user?.id ?? null} />
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            Escribe al menos 2 caracteres para buscar.
          </p>
        )}
      </section>

      <Sidebar categories={(categories as Category[]) ?? []} isLoggedIn={!!user} />
    </div>
  )
}
