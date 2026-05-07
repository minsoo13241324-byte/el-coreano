'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Category } from '@/types'

export function MobileCategoryBar({ categories }: { categories: Category[] }) {
  const pathname  = usePathname()
  const match     = pathname.match(/^\/c\/([^/]+)/)
  const activeSlug = match ? match[1] : null

  const linkClass = (active: boolean) =>
    `flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
      active
        ? 'bg-k-red text-white'
        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
    }`

  return (
    <div className="overflow-x-auto scrollbar-hide border-b border-gray-200 bg-white -mx-4 px-4 pb-2 pt-2">
      <div className="flex gap-2 w-max">
        <Link href="/" className={linkClass(pathname === '/')}>
          🏠 Inicio
        </Link>
        {categories.map(cat => (
          <Link key={cat.id} href={`/c/${cat.slug}`} className={linkClass(activeSlug === cat.slug)}>
            {cat.icon} {cat.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
