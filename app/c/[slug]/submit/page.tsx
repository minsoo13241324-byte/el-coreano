import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostForm } from '@/components/posts/PostForm'
import type { Category } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function SubmitPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: category }, { data: categories }] = await Promise.all([
    supabase.from('categories').select('*').eq('slug', slug).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!category) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Crear publicación</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          en{' '}
          <span className="font-medium text-k-red">
            {(category as Category).icon} {(category as Category).name}
          </span>
        </p>
      </div>

      <div className="bg-white rounded border border-gray-200 p-6">
        <PostForm
          categories={(categories as Category[]) ?? []}
          defaultCategoryId={(category as Category).id}
        />
      </div>
    </div>
  )
}
