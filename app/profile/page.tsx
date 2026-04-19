import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/posts/PostCard'
import { Avatar } from '@/components/ui/Avatar'
import { EditUsernameForm } from '@/components/profile/EditUsernameForm'
import { timeAgo } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'
import type { Post } from '@/types'

export const revalidate = 0

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: posts }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('posts')
      .select('*, profiles(id, username), categories(id, name, slug, icon)')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const { data: votes } = await supabase
    .from('post_votes')
    .select('post_id')
    .eq('user_id', user.id)
  const votedPostIds = new Set(votes?.map(v => v.post_id) ?? [])

  const enriched: Post[] = (posts ?? []).map(p => ({
    ...p,
    user_vote: votedPostIds.has(p.id) ? 1 : null,
  }))

  const totalUpvotes = posts?.reduce((sum, p) => sum + (p.upvotes ?? 0), 0) ?? 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="h-20 bg-gradient-to-br from-k-red via-red-400 to-k-blue" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <div className="ring-4 ring-white rounded-2xl shadow-md">
              <Avatar username={profile?.username ?? '?'} size="lg" />
            </div>
          </div>

          <EditUsernameForm currentUsername={profile?.username ?? ''} />

          <p className="text-sm text-slate-500 mt-1">
            Miembro desde {profile ? timeAgo(profile.created_at) : ''}
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-slate-100">
            <div>
              <p className="text-xl font-bold text-slate-900">{enriched.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Publicaciones</p>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{totalUpvotes}</p>
              <p className="text-xs text-slate-500 mt-0.5">Votos recibidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-700 text-sm">Mis publicaciones</h2>
          <Link
            href="/c/comunidad-general/submit"
            className="flex items-center gap-1 text-xs text-k-red hover:underline font-medium"
          >
            <PlusCircle size={13} />
            Nueva publicación
          </Link>
        </div>

        {enriched.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-10 text-center">
            <p className="text-3xl mb-3">✍️</p>
            <p className="text-slate-600 font-medium mb-1">Aún no has publicado nada</p>
            <p className="text-sm text-slate-400 mb-4">¡Comparte algo con la comunidad!</p>
            <Link
              href="/c/comunidad-general/submit"
              className="inline-flex items-center gap-1.5 bg-k-red text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-k-red-dark transition-colors"
            >
              <PlusCircle size={14} />
              Crear primera publicación
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enriched.map(post => (
              <PostCard key={post.id} post={post} userId={user.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
