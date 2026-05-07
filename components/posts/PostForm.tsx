'use client'

import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { Category } from '@/types'
import { createPost, updatePost } from '@/actions/posts'
import { createClient } from '@/lib/supabase/client'
import { Send, ImagePlus, X } from 'lucide-react'

interface ImageItem {
  file?: File
  preview: string
  url?: string
}

interface Props {
  categories: Category[]
  defaultCategoryId?: string
  editMode?: boolean
  postId?: string
  defaultTitle?: string
  defaultContent?: string
  defaultImageUrls?: string[]
}

export function PostForm({
  categories,
  defaultCategoryId,
  editMode = false,
  postId,
  defaultTitle = '',
  defaultContent = '',
  defaultImageUrls = [],
}: Props) {
  const [error, setError]         = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [images, setImages]       = useState<ImageItem[]>(
    defaultImageUrls.map(url => ({ preview: url, url }))
  )
  const [, startTransition]       = useTransition()
  const fileInputRef              = useRef<HTMLInputElement>(null)

  const addImages = (files: FileList | null) => {
    if (!files) return
    const remaining = 4 - images.length
    const toAdd = Array.from(files).slice(0, remaining)
    const items: ImageItem[] = toAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages(prev => [...prev, ...items])
  }

  const removeImage = (index: number) => {
    setImages(prev => {
      const next = [...prev]
      if (next[index].file) URL.revokeObjectURL(next[index].preview)
      next.splice(index, 1)
      return next
    })
  }

  const uploadNewImages = async (): Promise<string[]> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const results: string[] = []
    for (const item of images) {
      if (item.url) {
        results.push(item.url)
        continue
      }
      if (!item.file) continue
      const ext  = item.file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error: upErr } = await supabase.storage
        .from('post-images')
        .upload(path, item.file, { contentType: item.file.type })
      if (!upErr && data) {
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(data.path)
        results.push(publicUrl)
      }
    }
    return results
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const fd = new FormData(e.currentTarget)

    if (images.length > 0) {
      setUploading(true)
      try {
        const urls = await uploadNewImages()
        if (urls.length > 0) fd.set('image_urls', JSON.stringify(urls))
      } catch {
        setError('Error al subir las imágenes.')
        setUploading(false)
        return
      }
      setUploading(false)
    }

    startTransition(async () => {
      const result = editMode && postId
        ? await updatePost(postId, fd)
        : await createPost(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

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

      {/* Image upload */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Imágenes <span className="text-slate-400 font-normal">(máx. 4)</span>
        </label>

        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < 4 && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => addImages(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-slate-600 border border-dashed border-slate-300 hover:border-k-red hover:text-k-red px-4 py-2.5 rounded-lg transition-colors w-full justify-center"
            >
              <ImagePlus size={16} />
              {images.length === 0 ? 'Agregar imágenes' : `Agregar más (${images.length}/4)`}
            </button>
          </>
        )}
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
        <Button type="submit" disabled={uploading}>
          <Send size={13} />
          {uploading ? 'Subiendo…' : editMode ? 'Guardar cambios' : 'Publicar'}
        </Button>
      </div>
    </form>
  )
}
