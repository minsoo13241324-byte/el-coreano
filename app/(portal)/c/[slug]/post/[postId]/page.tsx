import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ScrollToTop } from '@/components/posts/ScrollToTop'
import { ViewCounter } from '@/components/posts/ViewCounter'
import { PinButton } from '@/components/posts/PinButton'
import { CategoryPostList } from '@/components/posts/CategoryPostList'
import { DeletePostButton } from '@/components/posts/DeletePostButton'
import { CommentList } from '@/components/comments/CommentList'
import { CommentForm } from '@/components/comments/CommentForm'
import { VoteButton } from '@/components/posts/VoteButton'
import { Avatar } from '@/components/ui/Avatar'
import { timeAgo } from '@/lib/utils'
import { Pencil, ChevronRight, MessageSquare } from 'lucide-react'
import type { Comment, Post, Category } from '@/types'

export const revalidate = 0

const PAGE_SIZE = 20

interface Props {
  params: Promise<{ slug: string; postId: string }>
  searchParams: Promise<{ sort?: string; page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params
  const supabase   = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, content')
    .eq('id', postId)
    .eq('is_deleted', false)
    .single()

  if (!post) return { title: 'El Coreano' }

  const description = post.content?.slice(0, 160) ?? 'Publicación en El Coreano'

  return {
    title: post.title,
    description,
    openGraph: { title: post.title, description, type: 'article', siteName: 'El Coreano' },
    twitter: { card: 'summary', title: post.title, description },
  }
}

export default async function PostInCategoryPage({ params, searchParams }: Props) {
  const { slug, postId }                             = await params
  const { sort = 'reciente', page: pageParam = '1' } = await searchParams
  const page                                         = Math.max(1, parseInt(pageParam, 10) || 1)
  const supabase                                     = await createClient()

  // 1차: category + user 병렬
  const [{ data: category }, { data: { user } }] = await Promise.all([
    supabase.from('categories').select('*').eq('slug', slug).single(),
    supabase.auth.getUser(),
  ])

  if (!category) notFound()

  const start = (page - 1) * PAGE_SIZE
  const end   = start + PAGE_SIZE - 1

  // 2차: 게시글 상세 + 목록 + 프로필 병렬
  const [
    { data: post },
    { data: listPosts, count },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('posts')
      .select('*, profiles(id, username, avatar_url), categories(id, name, slug, icon)')
      .eq('id', postId)
      .eq('is_deleted', false)
      .single(),
    supabase
      .from('posts')
      .select('*, profiles(id, username, avatar_url), categories(id, name, slug, icon)', { count: 'exact' })
      .eq('category_id', category.id)
      .eq('is_deleted', false)
      .order('is_pinned', { ascending: false })
      .order(sort === 'popular' ? 'upvotes' : 'created_at', { ascending: false })
      .range(start, end),
    user
      ? supabase.from('profiles').select('is_admin, username').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  if (!post) notFound()

  // 3차: 댓글 + 투표 병렬
  const [{ data: comments }, { data: allVotes }] = await Promise.all([
    supabase
      .from('comments')
      .select('*, profiles(id, username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true }),
    user
      ? supabase.from('post_votes').select('post_id, vote_type').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  const userPostVote = (allVotes ?? []).find(v => v.post_id === postId)?.vote_type ?? null
  const votedIds     = new Set((allVotes ?? []).map(v => v.post_id))

  const enrichedList: Post[] = (listPosts ?? []).map(p => ({
    ...p,
    user_vote: votedIds.has(p.id) ? 1 : null,
  }))

  const totalPages  = Math.ceil((count ?? 0) / PAGE_SIZE)
  const isOwner     = user?.id === post.user_id
  const isAdmin     = (profile as { is_admin?: boolean } | null)?.is_admin ?? false
  const catData     = post.categories as { id: string; name: string; slug: string; icon: string }
  const author      = post.profiles as { id: string; username: string; avatar_url: string | null }
  const myUsername  = (profile as { username?: string } | null)?.username ?? ''

  return (
    <div className="space-y-3">
      <ScrollToTop />
      <ViewCounter postId={postId} />

      {/* 게시글 상세 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 px-5 pt-4">
          <Link href="/" className="hover:text-slate-700 transition-colors">Inicio</Link>
          <ChevronRight size={14} className="text-slate-300" />
          <Link
            href={`/c/${slug}`}
            className="flex items-center gap-1 font-medium text-k-red hover:text-k-red-dark transition-colors"
          >
            {catData.icon} {catData.name}
          </Link>
        </nav>

        <div className="flex items-stretch">
          {/* Vote sidebar */}
          <div className="flex flex-col items-center justify-start pt-5 px-3 bg-slate-50 border-r border-slate-100 min-w-[52px]">
            <VoteButton
              postId={post.id}
              initialUpvotes={post.upvotes}
              initialVoted={userPostVote === 1}
              userId={user?.id ?? null}
            />
          </div>

          {/* 본문 */}
          <div className="flex-1 p-6 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <Avatar username={author.username} avatarUrl={author.avatar_url} size="sm" />
              <div className="text-sm">
                <span className="font-semibold text-slate-800">{author.username}</span>
                <span className="text-slate-400 ml-2">{timeAgo(post.created_at)}</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 leading-snug tracking-tight">
              {post.title}
            </h1>

            {post.content && (
              <div className="mt-4 text-slate-600 text-[15px] leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            )}

            {/* 이미지 */}
            {(post.image_urls?.length ?? 0) > 0 && (
              <div className={`mt-4 grid gap-2 ${
                post.image_urls.length === 1 ? 'grid-cols-1' :
                post.image_urls.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
              }`}>
                {post.image_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                      alt=""
                      className="w-full rounded-xl border border-slate-100 object-cover max-h-80 hover:opacity-90 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <MessageSquare size={13} />
                {post.comment_count} comentarios
              </span>
              {(isOwner || isAdmin) && (
                <div className="flex items-center gap-1 ml-auto">
                  {isAdmin && <PinButton postId={postId} isPinned={post.is_pinned ?? false} />}
                  {isOwner && (
                    <Link
                      href={`/post/${post.id}/edit`}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Pencil size={12} />
                      Editar
                    </Link>
                  )}
                  <DeletePostButton postId={postId} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 */}
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
            <CommentForm postId={postId} />
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
          postId={postId}
          currentUserId={user?.id ?? null}
          isAdmin={isAdmin}
        />
      </div>

      {/* 같은 카테고리 게시글 목록 */}
      <CategoryPostList
        category={category as Category}
        posts={enrichedList}
        slug={slug}
        userId={user?.id ?? null}
        selectedPostId={postId}
        currentPage={page}
        totalPages={totalPages}
        sort={sort}
        paginationBase={`/c/${slug}/post/${postId}`}
      />
    </div>
  )
}
