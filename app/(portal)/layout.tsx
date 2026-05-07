import { createClient } from '@/lib/supabase/server'
import { LeftNav } from '@/components/layout/LeftNav'
import { RightPanel } from '@/components/layout/RightPanel'
import { MobileCategoryBar } from '@/components/layout/MobileCategoryBar'
import type { Category, Post } from '@/types'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const [{ data: { user } }, { data: categories }, { data: popularRaw }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('categories').select('*').order('name'),
    supabase
      .from('posts')
      .select('id, title, upvotes, created_at, category_id, categories(slug)')
      .eq('is_deleted', false)
      .order('upvotes', { ascending: false })
      .limit(7),
  ])

  const cats = (categories as Category[]) ?? []

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-3">

      {/* 모바일 전용: 가로 스크롤 카테고리 바 */}
      <div className="lg:hidden mb-3">
        <MobileCategoryBar categories={cats} />
      </div>

      <div className="flex gap-5">

        {/* 왼쪽: lg 이상에서만 표시 */}
        <div className="hidden lg:block w-[180px] flex-shrink-0">
          <LeftNav categories={cats} />
        </div>

        {/* 중앙 */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* 오른쪽: xl 이상에서만 표시 */}
        <div className="hidden xl:block w-[220px] flex-shrink-0">
          <RightPanel
            isLoggedIn={!!user}
            popularPosts={(popularRaw as unknown as Post[]) ?? []}
          />
        </div>

      </div>
    </div>
  )
}
