import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/posts/PostCard'
import { Sidebar } from '@/components/layout/Sidebar'
import { TrendingUp, Clock, BookOpen, Users, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import type { Post, Category } from '@/types'

export const revalidate = 60

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const { sort = 'reciente' } = await searchParams
  const supabase = await createClient()

  const [{ data: { user } }, { data: posts }, { data: categories }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('posts')
      .select('*, profiles(id, username), categories(id, name, slug, icon)')
      .eq('is_deleted', false)
      .order(sort === 'popular' ? 'upvotes' : 'created_at', { ascending: false })
      .limit(50),
    supabase.from('categories').select('*').order('name'),
  ])

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
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

      {/* Welcome banner — solo para usuarios no logueados */}
      {!user && (
        <div className="relative overflow-hidden bg-gradient-to-br from-k-red via-red-500 to-k-blue rounded-2xl p-8 text-white shadow-lg">
          <div className="absolute top-0 right-0 text-[140px] opacity-10 leading-none select-none pointer-events-none -mt-4 -mr-4">
            한
          </div>
          <div className="relative z-10 max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-2">
              Bienvenido a
            </p>
            <h1 className="text-3xl font-bold leading-tight mb-3">
              El Coreano 🇰🇷
            </h1>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              La comunidad en español para aprender el idioma coreano, explorar K-POP, K-Dramas y la cultura de Corea.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/signup"
                className="bg-white text-k-red font-bold px-5 py-2.5 rounded-xl hover:bg-red-50 transition-colors shadow-sm text-sm"
              >
                Únete gratis
              </Link>
              <Link
                href="/c/alfabeto-coreano"
                className="bg-white/20 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-white/30 transition-colors text-sm border border-white/30"
              >
                Explorar →
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="relative z-10 flex gap-6 mt-8 pt-6 border-t border-white/20">
            {[
              { icon: BookOpen,      label: 'Categorías',    value: categories?.length ?? 10 },
              { icon: MessageCircle, label: 'Publicaciones', value: posts?.length ?? 0 },
              { icon: Users,         label: 'Comunidad',     value: 'Gratis' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <s.icon size={15} className="opacity-70" />
                <span className="text-sm">
                  <span className="font-bold">{s.value}</span>{' '}
                  <span className="opacity-70">{s.label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <section>
          {/* Sort tabs */}
          <div className="flex gap-1 mb-4 bg-white rounded-xl border border-slate-200 shadow-card p-1 w-fit">
            {[
              { label: 'Reciente', value: 'reciente', icon: Clock },
              { label: 'Popular',  value: 'popular',  icon: TrendingUp },
            ].map(tab => (
              <a
                key={tab.value}
                href={`/?sort=${tab.value}`}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                  sort === tab.value
                    ? 'bg-k-red text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </a>
            ))}
          </div>

          {enriched.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-card p-12 text-center">
              <p className="text-4xl mb-3">🌱</p>
              <p className="text-slate-700 font-semibold">¡Sé el primero en publicar!</p>
              <p className="text-sm text-slate-400 mt-1">La comunidad te está esperando.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enriched.map(post => (
                <PostCard key={post.id} post={post} userId={user?.id ?? null} />
              ))}
            </div>
          )}
        </section>

        <Sidebar
          categories={(categories as Category[]) ?? []}
          isLoggedIn={!!user}
        />
      </div>
    </div>
  )
}
