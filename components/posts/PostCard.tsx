import Link from 'next/link'
import { MessageSquare, Eye } from 'lucide-react'
import { Post } from '@/types'
import { timeAgo } from '@/lib/utils'
import { VoteButton } from './VoteButton'
import { Avatar } from '@/components/ui/Avatar'

interface Props {
  post: Post
  userId: string | null
  href?: string
  isSelected?: boolean
  isRead?: boolean
}

export function PostCard({ post, userId, href, isSelected = false, isRead = false }: Props) {
  const category    = post.categories!
  const author      = post.profiles!
  const postHref    = href ?? `/post/${post.id}`
  const isPinned    = post.is_pinned ?? false
  const thumbnail   = (post.image_urls?.length ?? 0) > 0 ? post.image_urls[0] : null

  return (
    <article className={`rounded-xl border shadow-card transition-all duration-150 group overflow-hidden ${
      isPinned && !isSelected
        ? 'bg-amber-50 border-amber-200 hover:border-amber-300 hover:shadow-card-hover'
        : isSelected
          ? 'bg-red-50 border-k-red shadow-card-hover'
          : 'bg-white border-slate-200 hover:shadow-card-hover hover:border-slate-300'
    }`}>
      <div className="flex">
        {/* Vote column */}
        <div className={`w-12 flex-shrink-0 flex flex-col items-center pt-3 pb-2 border-r ${
          isPinned && !isSelected ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'
        }`}>
          <VoteButton
            postId={post.id}
            initialUpvotes={post.upvotes}
            initialVoted={post.user_vote === 1}
            userId={userId}
          />
        </div>

        {/* Content column */}
        <div className="flex-1 p-4 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap mb-2">
            <Link
              href={`/c/${category.slug}`}
              className="inline-flex items-center gap-1 bg-red-50 text-k-red font-semibold px-2 py-0.5 rounded-full hover:bg-red-100 transition-colors"
            >
              {category.icon} {category.name}
            </Link>
            <span className="text-slate-300">·</span>
            <Avatar username={author.username} avatarUrl={(author as any).avatar_url ?? null} size="sm" />
            <span>{author.username}</span>
            <span className="text-slate-300">·</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>

          {/* Title row */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {isPinned && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded mr-1.5 align-middle">
                  📌 공지
                </span>
              )}
              <Link href={postHref}>
                <h2 className={`inline text-[15px] font-semibold leading-snug transition-colors ${
                  isSelected
                    ? 'text-k-red'
                    : isRead
                      ? 'text-slate-400 group-hover:text-slate-500'
                      : 'text-slate-900 group-hover:text-k-red'
                }`}>
                  {post.title}
                </h2>
              </Link>

              {post.content && (
                <p className={`mt-1.5 text-sm line-clamp-2 leading-relaxed ${
                  isRead ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  {post.content}
                </p>
              )}
            </div>

            {/* Thumbnail */}
            {thumbnail && (
              <Link href={postHref} className="flex-shrink-0 hidden sm:block">
                <img
                  src={thumbnail}
                  alt=""
                  className="w-20 h-16 object-cover rounded-lg border border-slate-100"
                />
              </Link>
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center gap-3">
            <Link
              href={postHref}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <MessageSquare size={12} />
              <span>{post.comment_count} comentarios</span>
            </Link>
            {(post.view_count ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Eye size={11} />
                {post.view_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
