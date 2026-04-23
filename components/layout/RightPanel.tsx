import Link from 'next/link'
import { Post } from '@/types'
import { timeAgo } from '@/lib/utils'

interface Props {
  isLoggedIn: boolean
  popularPosts: Post[]
}

export function RightPanel({ isLoggedIn, popularPosts }: Props) {
  return (
    <aside className="space-y-3 sticky top-[46px] self-start">

      {/* Login / User box */}
      {!isLoggedIn && (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
            <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider">회원</h3>
          </div>
          <div className="p-3 space-y-2">
            <p className="text-xs text-gray-600 leading-relaxed">
              커뮤니티에 참여하려면 로그인하세요.
            </p>
            <div className="flex gap-1.5">
              <Link
                href="/login"
                className="flex-1 text-center text-xs font-medium border border-gray-300 text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/signup"
                className="flex-1 text-center text-xs font-medium bg-k-red text-white px-2 py-1.5 rounded hover:bg-k-red-dark transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Popular posts */}
      {popularPosts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
            <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider">🔥 Popular</h3>
          </div>
          <ul className="py-1 divide-y divide-gray-100">
            {popularPosts.map((post, i) => (
              <li key={post.id} className="flex items-start gap-2 px-3 py-1.5 hover:bg-blue-50 group transition-colors">
                <span className="flex-shrink-0 text-xs font-bold text-gray-300 w-4 pt-0.5">{i + 1}</span>
                <Link
                  href={`/post/${post.id}`}
                  className="text-xs text-gray-700 group-hover:text-k-red transition-colors line-clamp-2 leading-relaxed"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Site info box */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
          <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider">El Coreano</h3>
        </div>
        <div className="p-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            Comunidad en español para aprender el idioma coreano, K-POP, K-Dramas y la cultura de Corea.
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {['한국어', 'K-POP', '한류'].map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

    </aside>
  )
}
