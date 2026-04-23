import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CommentList } from '@/components/comments/CommentList'
import { CommentForm } from '@/components/comments/CommentForm'
import { VoteButton } from '@/components/posts/VoteButton'
import { Avatar } from '@/components/ui/Avatar'
import { timeAgo } from '@/lib/utils'
import { Pencil, ChevronRight, MessageSquare } from 'lucide-react'
import type { Comment } from '@/types'
import { DeletePostButton } from './DeletePostButton'

interface Props {
  params: Promise<{ id: string }>
}

export const revalidate = 0

export default async function PostPage({ params }: Props) {
  const { id }   = await params
  const supabase = await createClient()

  const [{ data: post }, { data: { user } }] = await Promise.all([
    supabase
      .from('posts')
      .select('*, profiles(id, username), categories(id, name, slug, icon)')
      .eq('id', id)
      .eq('is_deleted', false)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!post) notFound()

  const [{ data: comments }, { data: profile }] = await Promise.all([
    supabase
      .from('comments')
      .select('*, profiles(id, username, avatar_url)')
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
    user
      ? supabase.from('profiles').select('is_admin, username').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  let userVote = null
  if (user) {
    const { data: vote } = await supabase
      .from('post_votes')
      .select('vote_type')
      .eq('user_id', user.id)
      .eq('post_id', id)
      .single()
    userVote = vote?.vote_type ?? null
  }

  const isOwner  = user?.id === post.user_id
  const isAdmin  = profile?.is_admin ?? false
  const category = post.categories as { id: string; name: string; slug: string; icon: string }
  const author   = post.profiles   as { id: string; username: string }
  const myUsername = (profile as { username?: string } | null)?.username ?? ''

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-700 transition-colors">Inicio</Link>
        <ChevronRight size={14} className="text-slate-300" />
        <Link
          href={`/c/${category.slug}`}
          className="flex items-center gap-1 font-medium text-k-red hover:text-k-red-dark transition-colors"
        >
          {category.icon} {category.name}
        </Link>
      </nav>

      {/* Post */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {/* Top bar con upvote */}
        <div className="flex items-stretch">
          {/* Vote sidebar */}
          <div className="flex flex-col items-center justify-start pt-5 px-3 bg-slate-50 border-r border-slate-100 min-w-[52px]">
            <VoteButton
              postId={post.id}
              initialUpvotes={post.upvotes}
              initialVoted={userVote === 1}
              userId={user?.id ?? null}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 p-6 min-w-0">
            {/* Author row */}
            <div className="flex items-center gap-2 mb-4">
              <Avatar username={author.username} size="sm" />
              <div className="text-sm">
                <span className="font-semibold text-slate-800">{author.username}</span>
                <span className="text-slate-400 ml-2">{timeAgo(post.created_at)}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-slate-900 leading-snug tracking-tight">
              {post.title}
            </h1>

            {/* Content */}
            {post.content && (
              <div className="mt-4 text-slate-600 text-[15px] leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <MessageSquare size={13} />
                {post.comment_count} comentarios
              </span>

              {(isOwner || isAdmin) && (
                <div className="flex items-center gap-1 ml-auto">
                  {isOwner && (
                    <Link
                      href={`/post/${post.id}/edit`}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Pencil size={12} />
                      Editar
                    </Link>
                  )}
                  <DeletePostButton postId={id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
        <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
          <MessageSquare size={17} className="text-k-red" />
          {post.comment_count} comentarios
        </h2>

        {user ? (
          <div className="mb-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Avatar username={myUsername || author.username} size="sm" />
              <span className="text-sm text-slate-500">
                Comentar como{' '}
                <span className="font-semibold text-slate-800">{myUsername || author.username}</span>
              </span>
            </div>
            <CommentForm postId={id} />
          </div>
        ) : (
          <div className="mb-6 pb-6 border-b border-slate-100">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-center">
              <p className="text-sm text-slate-600">
                <Link href="/login" className="text-k-red font-semibold hover:underline">
                  Inicia sesión
                </Link>{' '}
                para dejar un comentario
              </p>
            </div>
          </div>
        )}

        <CommentList
          comments={(comments as Comment[]) ?? []}
          postId={id}
          currentUserId={user?.id ?? null}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}
