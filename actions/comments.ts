'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createComment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const content  = (formData.get('content') as string).trim()
  const postId   = formData.get('post_id') as string
  const parentId = (formData.get('parent_id') as string) || null

  if (!content || content.length < 2) {
    return { error: 'El comentario es demasiado corto.' }
  }

  const { error } = await supabase
    .from('comments')
    .insert({ content, post_id: postId, user_id: user.id, parent_id: parentId })

  if (error) return { error: 'Error al publicar el comentario.' }

  revalidatePath(`/post/${postId}`)
  return { success: true }
}

export async function updateComment(commentId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const content = (formData.get('content') as string).trim()
  const postId  = formData.get('post_id') as string

  if (!content || content.length < 2) {
    return { error: 'El comentario es demasiado corto.' }
  }

  const { error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: 'Error al actualizar el comentario.' }

  revalidatePath(`/post/${postId}`)
  return { success: true }
}

export async function deleteComment(commentId: string, postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const { data: comment } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (!comment) return { error: 'Comentario no encontrado.' }

  const isOwner = comment.user_id === user.id
  const isAdmin = profile?.is_admin

  if (!isOwner && !isAdmin) return { error: 'Sin permiso para eliminar.' }

  await supabase
    .from('comments')
    .update({ is_deleted: true, content: '[comentario eliminado]' })
    .eq('id', commentId)

  revalidatePath(`/post/${postId}`)
  return { success: true }
}
