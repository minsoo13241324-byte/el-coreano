import type { Metadata } from 'next'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import type { Profile } from '@/types'

const SITE_DESCRIPTION =
  'Comunidad en español para aprender el idioma coreano, explorar el K-POP, K-Dramas y la cultura de Corea.'

export const metadata: Metadata = {
  title: { default: 'El Coreano – Aprende Hangul en comunidad', template: '%s – El Coreano' },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: 'El Coreano – Aprende Hangul en comunidad',
    description: SITE_DESCRIPTION,
    siteName: 'El Coreano',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary',
    title: 'El Coreano – Aprende Hangul en comunidad',
    description: SITE_DESCRIPTION,
  },
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
