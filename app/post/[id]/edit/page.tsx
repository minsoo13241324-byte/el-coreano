import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostForm } from '@/components/posts/PostForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id }   = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: post }, { data: categories }] = await Promise.all([
    supabase
      .from('posts')
      .select('*, categories(slug)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!post) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Editar publicación</h1>
      <div className="bg-white rounded border border-gray-200 p-6">
        <PostForm
          categories={categories ?? []}
          editMode
          postId={id}
          defaultTitle={post.title}
          defaultContent={post.content ?? ''}
          defaultCategoryId={post.category_id}
        />
      </div>
    </div>
  )
}
