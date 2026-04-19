'use client'

import { useState, useTransition } from 'react'
import { ArrowUp } from 'lucide-react'
import { votePost } from '@/actions/posts'
import { cn } from '@/lib/utils'

interface Props {
  postId: string
  initialUpvotes: number
  initialVoted: boolean
  userId: string | null
}

export function VoteButton({ postId, initialUpvotes, initialVoted, userId }: Props) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [voted, setVoted]     = useState(initialVoted)
  const [, startTransition]   = useTransition()

  const handleVote = () => {
    if (!userId) {
      window.location.href = '/login'
      return
    }
    const wasVoted = voted
    setVoted(!wasVoted)
    setUpvotes(u => wasVoted ? u - 1 : u + 1)

    startTransition(async () => {
      const result = await votePost(postId)
      if (result?.error) {
        setVoted(wasVoted)
        setUpvotes(u => wasVoted ? u + 1 : u - 1)
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={handleVote}
        className={cn(
          'p-1.5 rounded-lg transition-all duration-150',
          voted
            ? 'text-k-red bg-red-100'
            : 'text-slate-400 hover:text-k-red hover:bg-red-50'
        )}
        title={voted ? 'Quitar voto' : 'Votar'}
      >
        <ArrowUp size={16} strokeWidth={voted ? 2.5 : 1.5} />
      </button>
      <span className={cn(
        'text-xs font-bold tabular-nums leading-none',
        voted ? 'text-k-red' : 'text-slate-600'
      )}>
        {upvotes}
      </span>
    </div>
  )
}
