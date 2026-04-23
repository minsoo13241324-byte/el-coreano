'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { signup } from '@/actions/auth'
import { Button } from '@/components/ui/Button'

export default function SignupPage() {
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)
  const [, startTransition]     = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const fd       = new FormData(e.currentTarget)
    const password = fd.get('password') as string
    const confirm  = fd.get('confirm_password') as string

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    startTransition(async () => {
      const result = await signup(fd)
      if (result?.error) {
        setError(result.error)
      } else if (result?.needsConfirmation) {
        setSuccess(true)
      }
    })
  }

  if (success) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center bg-white rounded-2xl border border-slate-200 shadow-card p-8">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">¡Revisa tu correo!</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Te enviamos un enlace de confirmación. Haz clic en él para activar tu cuenta.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm text-k-red font-semibold hover:underline">
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-8">

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-k-red rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-white text-2xl font-bold">한</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Únete a El Coreano</h1>
            <p className="text-sm text-slate-500 mt-1">Aprende coreano con la comunidad</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre de usuario
              </label>
              <input
                name="username"
                type="text"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                placeholder="mi_usuario"
                className="input-base"
              />
              <p className="text-xs text-slate-400 mt-1">
                3–20 caracteres · solo letras, números y _
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirmar contraseña
              </label>
              <input
                name="confirm_password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                className="input-base"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full mt-2">
              Crear cuenta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-k-red font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
