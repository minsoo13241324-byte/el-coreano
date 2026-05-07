import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { PostListClient } from './PostListClient'
import { Pagination } from '@/components/ui/Pagination'
import type { Post, Category } from '@/types'

interface Props {
  category: Category
  posts: Post[]
  slug: string
  userId: string | null
  selectedPostId?: string
  currentPage: number
  totalPages: number
  sort: string
  paginationBase: string  // e.g. "/c/slug" or "/c/slug/post/abc"
}

export function CategoryPostList({
  category,
  posts,
  slug,
  userId,
  selectedPostId,
  currentPage,
  totalPages,
  sort,
  paginationBase,
}: Props) {
  const buildHref = (p: number) => `${paginationBase}?sort=${sort}&page=${p}`

  return (
    <div className="space-y-3">
      {/* 카테고리 헤더 */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>{category.icon}</span>
              {category.name}
            </h2>
            {category.description && (
              <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
            )}
          </div>
          <Link
            href={userId ? `/c/${slug}/submit` : '/login'}
            className="flex items-center gap-1.5 bg-k-red text-white text-sm font-medium px-3 py-1.5 rounded hover:bg-k-red-dark transition-colors flex-shrink-0"
          >
            <PlusCircle size={14} />
            Publicar
          </Link>
        </div>
      </div>

      {/* 정렬 탭 */}
      <div className="flex gap-1 bg-white rounded border border-gray-200 p-1 w-fit">
        {[{ label: 'Reciente', value: 'reciente' }, { label: 'Popular', value: 'popular' }].map(tab => (
          <a
            key={tab.value}
            href={`/c/${slug}?sort=${tab.value}`}
            className={`px-4 py-1.5 text-sm rounded font-medium transition-colors ${
              sort === tab.value ? 'bg-k-red text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* 글 목록 */}
      {posts.length === 0 ? (
        <div className="bg-white rounded border border-gray-200 p-8 text-center">
          <p className="text-4xl mb-2">🌱</p>
          <p className="text-gray-500 mb-3">Aún no hay publicaciones en esta categoría.</p>
          <Link
            href={userId ? `/c/${slug}/submit` : '/login'}
            className="inline-flex items-center gap-1.5 bg-k-red text-white text-sm font-medium px-4 py-2 rounded hover:bg-k-red-dark"
          >
            <PlusCircle size={14} />
            Crear la primera publicación
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <PostListClient
            posts={posts}
            slug={slug}
            userId={userId}
            selectedPostId={selectedPostId}
          />
          <div className="bg-white rounded border border-gray-200">
            <Pagination currentPage={currentPage} totalPages={totalPages} buildHref={buildHref} />
          </div>
        </div>
      )}
    </div>
  )
}
