import Link from 'next/link'
import { Search, PlusCircle, Shield, LogOut } from 'lucide-react'
import { logout } from '@/actions/auth'
import { Avatar } from '@/components/ui/Avatar'
import type { Profile } from '@/types'

interface Props {
  profile: Profile | null
}

export function Header({ profile }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 bg-k-red rounded-lg flex items-center justify-center shadow-sm group-hover:bg-k-red-dark transition-colors">
            <span className="text-white text-sm font-bold">한</span>
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight hidden sm:block">
            El Coreano
          </span>
        </Link>

        {/* Search */}
        <form action="/search" className="flex-1 max-w-sm mx-auto">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              name="q"
              type="search"
              placeholder="Buscar publicaciones…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-k-red/20 focus:border-k-red focus:bg-white transition-all"
            />
          </div>
        </form>

        {/* Nav */}
        <nav className="ml-auto flex items-center gap-2">
          {profile ? (
            <>
              <Link
                href="/c/comunidad-general/submit"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium bg-k-red text-white hover:bg-k-red-dark px-3.5 py-2 rounded-xl shadow-sm transition-colors"
              >
                <PlusCircle size={14} />
                Crear
              </Link>

              {profile.is_admin && (
                <Link
                  href="/admin"
                  className="p-2 text-slate-500 hover:text-k-blue hover:bg-blue-50 rounded-lg transition-colors"
                  title="Administración"
                >
                  <Shield size={16} />
                </Link>
              )}

              <Link href="/profile" className="flex items-center gap-2 pl-1 hover:opacity-80 transition-opacity">
                <Avatar username={profile.username} size="sm" />
                <span className="hidden md:block text-sm font-medium text-slate-700">
                  {profile.username}
                </span>
              </Link>

              <form action={logout}>
                <button
                  type="submit"
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={15} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-k-red text-white hover:bg-k-red-dark px-3.5 py-2 rounded-xl shadow-sm transition-colors"
              >
                Registrarse
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
