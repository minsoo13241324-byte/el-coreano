import { createClient } from '@/lib/supabase/server'
import { LeftNav } from '@/components/layout/LeftNav'
import { PortalSection } from '@/components/layout/PortalSection'
import { RightPanel } from '@/components/layout/RightPanel'
import type { Post, Category } from '@/types'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: { user } }, { data: categories }, { data: allPosts }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('categories').select('*').order('name'),
    supabase
      .from('posts')
      .select('*, profiles(id, username, avatar_url), categories(id, name, slug, icon)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  // Popular posts for right panel (top 7 by upvotes)
  const popularPosts: Post[] = [...(allPosts ?? [])]
    .sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0))
    .slice(0, 7)

  // Group posts by category, keep latest 7 per category
  const cats = (categories as Category[]) ?? []
  const postsByCategory: Record<string, Post[]> = {}
  for (const cat of cats) {
    postsByCategory[cat.id] = (allPosts ?? [])
      .filter(p => p.category_id === cat.id)
      .slice(0, 7)
  }

  // Recent posts section (across all categories, latest 10)
  const recentPosts: Post[] = (allPosts ?? []).slice(0, 10)

  return (
    <div className="max-w-[1100px] mx-auto px-3 py-3">
      <div className="grid grid-cols-[180px_1fr_200px] gap-3">

        {/* Left: category nav */}
        <LeftNav categories={cats} />

        {/* Center: multi-section feed */}
        <main className="space-y-3 min-w-0">

          {/* Recent across all boards */}
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
              <span className="font-bold text-sm text-gray-800">🕒 Reciente</span>
              <a href="/?sort=reciente" className="text-xs text-gray-400 hover:text-k-red transition-colors">
                더보기 &rsaquo;
              </a>
            </div>
            <ul className="divide-y divide-gray-100">
              {recentPosts.length === 0 ? (
                <li className="px-3 py-4 text-xs text-gray-400 text-center">
                  Aún no hay publicaciones.
                </li>
              ) : recentPosts.map(post => {
                const cat = post.categories!
                return (
                  <li key={post.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 group transition-colors">
                    <a
                      href={`/c/${cat.slug}`}
                      className="flex-shrink-0 text-xs text-gray-400 hover:text-k-red transition-colors hidden sm:block w-[90px] truncate"
                    >
                      {cat.icon} {cat.name}
                    </a>
                    <a
                      href={`/post/${post.id}`}
                      className="flex-1 min-w-0 text-xs text-gray-800 group-hover:text-k-red transition-colors line-clamp-1"
                    >
                      {post.title}
                    </a>
                    <span className="flex-shrink-0 text-xs text-gray-400 hidden sm:block">
                      {post.profiles?.username}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* One section per category (only categories that have posts) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cats
              .filter(cat => (postsByCategory[cat.id]?.length ?? 0) > 0)
              .map(cat => (
                <PortalSection
                  key={cat.id}
                  category={cat}
                  posts={postsByCategory[cat.id] ?? []}
                />
              ))}
          </div>

        </main>

        {/* Right: login box + popular */}
        <RightPanel isLoggedIn={!!user} popularPosts={popularPosts} />

      </div>
    </div>
  )
}
