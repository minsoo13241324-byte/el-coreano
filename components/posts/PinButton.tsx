'use client'

import { useTransition } from 'react'
import { Pin, PinOff } from 'lucide-react'
import { togglePinPost } from '@/actions/posts'

export function PinButton({ postId, isPinned }: { postId: string; isPinned: boolean }) {
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await togglePinPost(postId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
        isPinned
          ? 'text-amber-600 hover:bg-amber-50'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
      }`}
    >
      {isPinned ? <PinOff size={12} /> : <Pin size={12} />}
      {isPinned ? 'Desfijar' : 'Fijar'}
    </button>
  )
}
