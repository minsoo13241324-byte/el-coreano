import Link from 'next/link'
import { MessageSquare, ThumbsUp } from 'lucide-react'
import { Post, Category } from '@/types'
import { timeAgo } from '@/lib/utils'

interface Props {
  category: Category
  posts: Post[]
}

export function PortalSection({ category, posts }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <Link
          href={`/c/${category.slug}`}
          className="flex items-center gap-1.5 font-bold text-sm text-gray-800 hover:text-k-red transition-colors"
        >
          <span>{category.icon}</span>
          <span>{category.name}</span>
        </Link>
        <Link
          href={`/c/${category.slug}`}
          className="text-xs text-gray-400 hover:text-k-red transition-colors"
        >
          더보기 &rsaquo;
        </Link>
      </div>

      {/* Post list */}
      <ul className="divide-y divide-gray-100">
        {posts.length === 0 ? (
          <li className="px-3 py-4 text-xs text-gray-400 text-center">
            Aún no hay publicaciones.
          </li>
        ) : (
          posts.map(post => (
            <li key={post.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 group transition-colors">
              {/* Vote count */}
              <span className="flex-shrink-0 w-6 text-center text-xs font-bold text-gray-400">
                {post.upvotes > 0 ? (
                  <span className="text-k-red">{post.upvotes}</span>
                ) : (
                  <ThumbsUp size={10} className="mx-auto text-gray-300" />
                )}
              </span>

              {/* Title */}
              <Link
                href={`/c/${category.slug}/post/${post.id}`}
                className="flex-1 min-w-0 text-xs text-gray-800 group-hover:text-k-red transition-colors line-clamp-1"
              >
                {post.title}
              </Link>

              {/* Meta: comments + time */}
              <div className="flex items-center gap-2 flex-shrink-0 text-gray-400">
                {post.comment_count > 0 && (
                  <span className="flex items-center gap-0.5 text-xs">
                    <MessageSquare size={10} />
                    {post.comment_count}
                  </span>
                )}
                <span className="text-xs hidden sm:block">{timeAgo(post.created_at)}</span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
