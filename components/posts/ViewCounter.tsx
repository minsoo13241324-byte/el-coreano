'use client'

import { useEffect, useRef } from 'react'
import { incrementViewCount } from '@/actions/posts'

export function ViewCounter({ postId }: { postId: string }) {
  const counted = useRef(false)

  useEffect(() => {
    if (counted.current) return
    counted.current = true
    incrementViewCount(postId)
  }, [postId])

  return null
}
