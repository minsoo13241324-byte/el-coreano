'use client'

import { useState, useEffect } from 'react'
import { PostCard } from './PostCard'
import type { Post } from '@/types'

const STORAGE_KEY = 'el_coreano_read'
const MAX_ENTRIES = 300

interface Props {
  posts: Post[]
  slug: string
  userId: string | null
  selectedPostId?: string
}

export function PostListClient({ posts, slug, userId, selectedPostId }: Props) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setReadIds(new Set(JSON.parse(raw) as string[]))
    } catch {}
  }, [])

  const markRead = (postId: string) => {
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(postId)
      let arr = [...next]
      if (arr.length > MAX_ENTRIES) arr = arr.slice(arr.length - MAX_ENTRIES)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch {}
      return new Set(arr)
    })
  }

  return (
    <div className="space-y-3">
      {posts.map(post => (
        <div key={post.id} onClick={() => markRead(post.id)}>
          <PostCard
            post={post}
            userId={userId}
            href={`/c/${slug}/post/${post.id}`}
            isSelected={post.id === selectedPostId}
            isRead={readIds.has(post.id) && post.id !== selectedPostId}
          />
        </div>
      ))}
    </div>
  )
}
