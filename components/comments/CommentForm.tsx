'use client'

import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { createComment } from '@/actions/comments'
import { Send } from 'lucide-react'

interface Props {
  postId: string
  parentId?: string | null
  onDone?: () => void
  placeholder?: string
}

export function CommentForm({ postId, parentId = null, onDone, placeholder }: Props) {
  const [error, setError]   = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const formRef             = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createComment(fd)
      if (result?.error) {
        setError(result.error)
      } else {
        formRef.current?.reset()
        onDone?.()
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
      <input type="hidden" name="post_id"   value={postId} />
      <input type="hidden" name="parent_id" value={parentId ?? ''} />
      <textarea
        name="content"
        required
        rows={3}
        placeholder={placeholder ?? '¿Qué piensas? Comparte tu comentario…'}
        className="input-base resize-y"
      />
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <div className="flex justify-end gap-2">
        {onDone && (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            Cancelar
          </Button>
        )}
        <Button type="submit" size="sm">
          <Send size={12} />
          Comentar
        </Button>
      </div>
    </form>
  )
}
