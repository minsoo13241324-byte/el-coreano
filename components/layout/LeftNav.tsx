import Link from 'next/link'
import { Category } from '@/types'

interface Props {
  categories: Category[]
  activeSlug?: string
}

export function LeftNav({ categories, activeSlug }: Props) {
  return (
    <nav className="space-y-2 sticky top-[46px] self-start">
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
          <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider">게시판</h3>
        </div>
        <ul className="py-1">
          <li>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors"
            >
              🏠 <span className="text-xs">Inicio</span>
            </Link>
          </li>
          <li className="border-t border-gray-100" />
          {categories.map(cat => (
            <li key={cat.id}>
              <Link
                href={`/c/${cat.slug}`}
                className={`flex items-center justify-between px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                  activeSlug === cat.slug
                    ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                    : 'text-gray-700'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="text-sm">{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </span>
                {cat.post_count > 0 && (
                  <span className="text-gray-400 flex-shrink-0 ml-1">{cat.post_count}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick links */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
          <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider">링크</h3>
        </div>
        <ul className="py-1">
          {[
            { href: '/?sort=reciente', label: '🕒 Reciente' },
            { href: '/?sort=popular',  label: '🔥 Popular' },
            { href: '/search',         label: '🔍 Buscar' },
          ].map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
