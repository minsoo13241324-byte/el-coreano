import { createClient } from '@/lib/supabase/server'
import { LeftNav } from '@/components/layout/LeftNav'
import { RightPanel } from '@/components/layout/RightPanel'
import type { Category, Post } from '@/types'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const [{ data: { user } }, { data: categories }, { data: popularRaw }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('categories').select('*').order('name'),
    supabase
      .from('posts')
      .select('id, title, upvotes, created_at, category_id')
      .eq('is_deleted', false)
      .order('upvotes', { ascending: false })
      .limit(7),
  ])

  return (
    <div className="max-w-[1100px] mx-auto px-3 py-3">
      <div className="grid grid-cols-[180px_1fr_200px] gap-3">

        {/* 왼쪽: 항상 유지되는 카테고리 네비 */}
        <LeftNav categories={(categories as Category[]) ?? []} />

        {/* 중앙: 페이지마다 변경 */}
        <main className="min-w-0">
          {children}
        </main>

        {/* 오른쪽: 항상 유지 */}
        <RightPanel
          isLoggedIn={!!user}
          popularPosts={(popularRaw as Post[]) ?? []}
        />

      </div>
    </div>
  )
}
