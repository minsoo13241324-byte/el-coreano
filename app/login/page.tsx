'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { login } from '@/actions/auth'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const [error, setError]   = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await login(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-8">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-k-red rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-white text-2xl font-bold">한</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Bienvenido de nuevo</h1>
            <p className="text-sm text-slate-500 mt-1">Inicia sesión en El Coreano</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
                placeholder="••••••••"
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
              Iniciar sesión
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link href="/signup" className="text-k-red font-semibold hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
