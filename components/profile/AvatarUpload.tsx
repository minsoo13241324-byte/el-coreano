'use client'

import { useRef, useState, useTransition } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'

interface Props {
  userId: string
  username: string
  currentAvatarUrl: string | null
}

export function AvatarUpload({ userId, username, currentAvatarUrl }: Props) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)
  const [, startTransition]       = useTransition()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen no puede superar 2MB.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes.')
      return
    }

    setError(null)
    setUploading(true)

    const supabase = createClient()
    const ext      = file.name.split('.').pop()
    const path     = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('Error al subir la imagen.')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    // Agregar timestamp para evitar caché
    const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`

    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    setAvatarUrl(urlWithTimestamp)
    setUploading(false)
  }

  return (
    <div className="relative inline-block">
      <div className="ring-4 ring-white rounded-2xl shadow-md overflow-hidden">
        <Avatar username={username} avatarUrl={avatarUrl} size="lg" />
      </div>

      {/* Upload button */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 w-7 h-7 bg-k-red text-white rounded-full flex items-center justify-center shadow-md hover:bg-k-red-dark transition-colors disabled:opacity-70"
        title="Cambiar foto"
      >
        {uploading
          ? <Loader2 size={13} className="animate-spin" />
          : <Camera size={13} />
        }
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <p className="absolute top-full mt-1 text-xs text-red-600 whitespace-nowrap">{error}</p>
      )}
    </div>
  )
}
