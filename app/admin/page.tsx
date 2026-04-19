import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { timeAgo } from '@/lib/utils'
import { Shield, Users, FileText, MessageSquare } from 'lucide-react'
import { AdminDeletePostButton } from './DeletePostButton'

export const revalidate = 0

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) notFound()

  // Fetch stats and data in parallel
  const [
    { count: userCount },
    { count: postCount },
    { count: commentCount },
    { data: recentPosts },
    { data: users },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase
      .from('posts')
      .select('*, profiles(username), categories(name, slug)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={22} className="text-k-red" />
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Usuarios', value: userCount ?? 0,   icon: Users },
          { label: 'Publicaciones', value: postCount ?? 0,  icon: FileText },
          { label: 'Comentarios', value: commentCount ?? 0, icon: MessageSquare },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <stat.icon size={18} className="text-k-red" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent posts */}
      <div className="bg-white rounded border border-gray-200 mb-6">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Publicaciones recientes</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentPosts?.map(post => (
            <div key={post.id} className="px-5 py-3 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link href={`/post/${post.id}`} className="text-sm font-medium text-gray-800 hover:text-k-red line-clamp-1">
                  {post.title}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  por {(post.profiles as { username: string })?.username} ·{' '}
                  {(post.categories as { name: string })?.name} ·{' '}
                  {timeAgo(post.created_at)}
                </p>
              </div>
              <AdminDeletePostButton postId={post.id} />
            </div>
          ))}
        </div>
      </div>

      {/* Users */}
      <div className="bg-white rounded border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Usuarios recientes</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {users?.map(u => (
            <div key={u.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-800">{u.username}</span>
                {u.is_admin && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">admin</span>
                )}
                {u.is_banned && (
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">baneado</span>
                )}
              </div>
              <span className="text-xs text-gray-400">{timeAgo(u.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
