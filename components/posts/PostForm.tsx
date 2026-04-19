'use client'

import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { Category } from '@/types'
import { createPost, updatePost } from '@/actions/posts'
import { Send } from 'lucide-react'

interface Props {
  categories: Category[]
  defaultCategoryId?: string
  editMode?: boolean
  postId?: string
  defaultTitle?: string
  defaultContent?: string
}

export function PostForm({
  categories,
  defaultCategoryId,
  editMode = false,
  postId,
  defaultTitle = '',
  defaultContent = '',
}: Props) {
  const [error, setError]   = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const formRef             = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = editMode && postId
        ? await updatePost(postId, fd)
        : await createPost(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

      {/* Category selector */}
      {!editMode && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Categoría <span className="text-k-red">*</span>
          </label>
          <select
            name="category_id"
            defaultValue={defaultCategoryId ?? ''}
            required
            className="input-base"
          >
            <option value="" disabled>Selecciona una categoría…</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Título <span className="text-k-red">*</span>
        </label>
        <input
          name="title"
          type="text"
          defaultValue={defaultTitle}
          required
          maxLength={200}
          placeholder="¿Sobre qué trata tu publicación?"
          className="input-base text-base"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Contenido <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          name="content"
          defaultValue={defaultContent}
          rows={7}
          placeholder="Comparte más detalles, preguntas o recursos…"
          className="input-base resize-y"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="secondary" onClick={() => history.back()}>
          Cancelar
        </Button>
        <Button type="submit">
          <Send size={13} />
          {editMode ? 'Guardar cambios' : 'Publicar'}
        </Button>
      </div>
    </form>
  )
}
