import { createClient } from '@/lib/supabase/server'
import { PortalSection } from '@/components/layout/PortalSection'
import type { Post, Category } from '@/types'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: allPosts }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase
      .from('posts')
      .select('*, profiles(id, username, avatar_url), categories(id, name, slug, icon)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  const cats = (categories as Category[]) ?? []

  // 카테고리별 최신 7개
  const postsByCategory: Record<string, Post[]> = {}
  for (const cat of cats) {
    postsByCategory[cat.id] = (allPosts ?? [])
      .filter(p => p.category_id === cat.id)
      .slice(0, 7)
  }

  // 전체 최신 10개
  const recentPosts: Post[] = (allPosts ?? []).slice(0, 10)

  return (
    <div className="space-y-3">

      {/* 전체 최신 글 */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
          <span className="font-bold text-sm text-gray-800">🕒 Reciente</span>
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
                  href={`/c/${cat.slug}/post/${post.id}`}
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

      {/* 카테고리별 섹션 */}
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
    </div>
  )
}
