import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  currentPage: number
  totalPages: number
  buildHref: (page: number) => string
}

export function Pagination({ currentPage, totalPages, buildHref }: Props) {
  if (totalPages <= 1) return null

  const pages = buildPageNumbers(currentPage, totalPages)

  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="flex items-center justify-center w-8 h-8 rounded text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={16} />
        </Link>
      ) : (
        <span className="flex items-center justify-center w-8 h-8 rounded text-gray-300 cursor-not-allowed">
          <ChevronLeft size={16} />
        </span>
      )}

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="flex items-center justify-center w-8 h-8 text-sm text-gray-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p as number)}
            className={`flex items-center justify-center w-8 h-8 rounded text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-k-red text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="flex items-center justify-center w-8 h-8 rounded text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span className="flex items-center justify-center w-8 h-8 rounded text-gray-300 cursor-not-allowed">
          <ChevronRight size={16} />
        </span>
      )}
    </div>
  )
}

function buildPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '…')[] = [1]

  if (current > 3) pages.push('…')

  const start = Math.max(2, current - 1)
  const end   = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('…')
  pages.push(total)

  return pages
}
