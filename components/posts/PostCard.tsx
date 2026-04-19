import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { Post } from '@/types'
import { timeAgo } from '@/lib/utils'
import { VoteButton } from './VoteButton'

interface Props {
  post: Post
  userId: string | null
}

export function PostCard({ post, userId }: Props) {
  const category = post.categories!
  const author   = post.profiles!

  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all duration-150 group overflow-hidden">
      <div className="flex">
        {/* Vote column */}
        <div className="w-12 flex-shrink-0 flex flex-col items-center pt-3 pb-2 bg-slate-50 border-r border-slate-100">
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
            <span>{author.username}</span>
            <span className="text-slate-300">·</span>
            <span>{timeAgo(post.created_at)}</span>
          </div>

          {/* Title */}
          <Link href={`/post/${post.id}`}>
            <h2 className="text-[15px] font-semibold text-slate-900 group-hover:text-k-red line-clamp-2 leading-snug transition-colors">
              {post.title}
            </h2>
          </Link>

          {/* Content preview */}
          {post.content && (
            <p className="mt-1.5 text-sm text-slate-500 line-clamp-2 leading-relaxed">
              {post.content}
            </p>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center gap-2">
            <Link
              href={`/post/${post.id}`}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <MessageSquare size={12} />
              <span>{post.comment_count} comentarios</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
