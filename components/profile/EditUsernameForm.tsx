'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { updateUsername } from '@/actions/auth'
import { Pencil, Check, X } from 'lucide-react'

interface Props {
  currentUsername: string
}

export function EditUsernameForm({ currentUsername }: Props) {
  const [editing, setEditing]   = useState(false)
  const [value, setValue]       = useState(currentUsername)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)
  const [, startTransition]     = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateUsername(fd)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setEditing(false)
      }
    })
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-slate-900">{value}</h1>
        {success && (
          <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            ¡Actualizado!
          </span>
        )}
        <button
          onClick={() => { setEditing(true); setSuccess(false) }}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Cambiar nombre de usuario"
        >
          <Pencil size={14} />
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          name="username"
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          minLength={3}
          maxLength={20}
          pattern="[a-z0-9_]+"
          required
          autoFocus
          className="input-base max-w-[200px] text-base font-bold"
        />
        <Button type="submit" size="sm">
          <Check size={13} />
          Guardar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => { setEditing(false); setValue(currentUsername); setError(null) }}
        >
          <X size={13} />
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <p className="text-xs text-slate-400 whitespace-normal break-words max-w-xs">
        3–20 caracteres · solo letras minúsculas, números y guión bajo _
      </p>
    </form>
  )
}
