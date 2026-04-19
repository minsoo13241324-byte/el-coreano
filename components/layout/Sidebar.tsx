import Link from 'next/link'
import { PlusCircle, Flame } from 'lucide-react'
import { Category } from '@/types'

interface Props {
  categories: Category[]
  activeSlug?: string
  isLoggedIn?: boolean
}

export function Sidebar({ categories, activeSlug, isLoggedIn }: Props) {
  const totalPosts = categories.reduce((s, c) => s + c.post_count, 0)

  return (
    <aside className="space-y-4 sticky top-[72px] self-start">

      {/* Community card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <div className="h-16 bg-gradient-to-br from-k-red via-red-500 to-k-blue relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 text-5xl select-none">
            한
          </div>
        </div>
        <div className="p-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-1.5">
            <span>🇰🇷</span> El Coreano
          </h2>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            Comunidad hispanohablante para aprender coreano y explorar la cultura de Corea.
          </p>

          <div className="mt-3 pt-3 border-t border-slate-100 flex gap-5 text-sm">
            <div>
              <p className="font-bold text-slate-900">{totalPosts}</p>
              <p className="text-slate-500 text-xs mt-0.5">Publicaciones</p>
            </div>
            <div>
              <p className="font-bold text-slate-900">{categories.length}</p>
              <p className="text-slate-500 text-xs mt-0.5">Categorías</p>
            </div>
          </div>

          <Link
            href={isLoggedIn ? '/c/comunidad-general/submit' : '/login'}
            className="mt-3 w-full flex items-center justify-center gap-1.5 bg-k-red text-white text-sm font-semibold rounded-xl py-2.5 hover:bg-k-red-dark transition-colors shadow-sm"
          >
            <PlusCircle size={15} />
            Crear publicación
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Flame size={14} className="text-k-red" />
          <h3 className="font-semibold text-sm text-slate-700">Categorías</h3>
        </div>
        <ul>
          <li>
            <Link
              href="/"
              className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                !activeSlug
                  ? 'bg-red-50 text-k-red font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">🏠 Inicio</span>
            </Link>
          </li>
          {categories.map((cat, i) => (
            <li key={cat.id}>
              <Link
                href={`/c/${cat.slug}`}
                className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors border-t border-slate-50 ${
                  activeSlug === cat.slug
                    ? 'bg-red-50 text-k-red font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span>{cat.icon}</span>
                  <span className="truncate max-w-[140px]">{cat.name}</span>
                </span>
                {cat.post_count > 0 && (
                  <span className="text-xs text-slate-400 font-medium flex-shrink-0 bg-slate-100 px-1.5 py-0.5 rounded-full">
                    {cat.post_count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-slate-400 text-center px-2">
        El Coreano © {new Date().getFullYear()}
      </p>
    </aside>
  )
}
