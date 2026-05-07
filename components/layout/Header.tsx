import Link from 'next/link'
import { Search, Shield, LogOut } from 'lucide-react'
import { logout } from '@/actions/auth'
import { Avatar } from '@/components/ui/Avatar'
import type { Profile } from '@/types'

interface Props {
  profile: Profile | null
}

export function Header({ profile }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-300 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 h-[42px] flex items-center gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0 group">
          <div className="w-6 h-6 bg-k-red flex items-center justify-center rounded-sm">
            <span className="text-white text-xs font-bold">한</span>
          </div>
          <span className="font-bold text-gray-900 text-sm tracking-tight hidden sm:block">
            El Coreano
          </span>
        </Link>

        {/* Divider */}
        <div className="h-4 w-px bg-gray-300 hidden md:block" />

        {/* Nav links — 데스크탑만 */}
        <nav className="hidden md:flex items-center gap-0 text-xs">
          {[
            { href: '/',            label: 'Inicio'  },
            { href: '/?sort=popular', label: 'Popular' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-2.5 py-1 text-gray-600 hover:text-k-red hover:bg-gray-100 transition-colors rounded"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search — 항상 표시, 모바일에서 더 작게 */}
        <form action="/search" className="flex-1 max-w-[280px] ml-auto">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              name="q"
              type="search"
              placeholder="Buscar…"
              className="w-full pl-7 pr-2 py-1 text-xs rounded border border-gray-300 bg-gray-50
                         focus:outline-none focus:ring-1 focus:ring-k-red focus:border-k-red
                         focus:bg-white transition-all"
            />
          </div>
        </form>

        {/* Auth */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {profile ? (
            <>
              {profile.is_admin && (
                <Link
                  href="/admin"
                  className="p-1.5 text-gray-500 hover:text-k-blue hover:bg-blue-50 rounded transition-colors"
                  title="Administración"
                >
                  <Shield size={14} />
                </Link>
              )}

              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Avatar username={profile.username} avatarUrl={(profile as any).avatar_url ?? null} size="sm" />
                <span className="hidden md:block text-xs font-medium text-gray-700 max-w-[80px] truncate">
                  {profile.username}
                </span>
              </Link>

              <form action={logout}>
                <button
                  type="submit"
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={13} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Link
                href="/login"
                className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors hidden sm:block"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="text-xs font-medium bg-k-red text-white hover:bg-k-red-dark px-2.5 py-1 rounded transition-colors"
              >
                가입
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
