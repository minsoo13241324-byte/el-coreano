import type { Metadata } from 'next'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import type { Profile } from '@/types'

export const metadata: Metadata = {
  title: 'El Coreano – Aprende Hangul en comunidad',
  description:
    'Comunidad en español para aprender el idioma coreano, explorar el K-POP, K-Dramas y la cultura de Corea.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <html lang="es">
      <body>
        <Header profile={profile} />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
