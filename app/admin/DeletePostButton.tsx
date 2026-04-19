'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deletePost } from '@/actions/posts'

export function AdminDeletePostButton({ postId }: { postId: string }) {
  const [, startTransition] = useTransition()

  const handleClick = () => {
    if (!confirm('¿Eliminar esta publicación?')) return
    startTransition(async () => {
      await deletePost(postId)
    })
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 flex-shrink-0"
    >
      <Trash2 size={12} />
      Eliminar
    </button>
  )
}
