'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const title      = (formData.get('title') as string).trim()
  const content    = (formData.get('content') as string | null)?.trim() || null
  const categoryId = formData.get('category_id') as string
  const imageUrlsRaw = formData.get('image_urls') as string | null
  const imageUrls  = imageUrlsRaw ? (JSON.parse(imageUrlsRaw) as string[]) : []

  if (!title || title.length < 5) {
    return { error: 'El título debe tener al menos 5 caracteres.' }
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({ title, content, category_id: categoryId, user_id: user.id, image_urls: imageUrls })
    .select('id, categories(slug)')
    .single()

  if (error) return { error: 'Error al crear la publicación.' }

  const categorySlug = (post.categories as unknown as { slug: string }).slug
  revalidatePath('/')
  revalidatePath(`/c/${categorySlug}`)
  redirect(`/c/${categorySlug}/post/${post.id}`)
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const title        = (formData.get('title') as string).trim()
  const content      = (formData.get('content') as string | null)?.trim() || null
  const imageUrlsRaw = formData.get('image_urls') as string | null
  const imageUrls    = imageUrlsRaw ? (JSON.parse(imageUrlsRaw) as string[]) : undefined

  if (!title || title.length < 5) {
    return { error: 'El título debe tener al menos 5 caracteres.' }
  }

  const update: Record<string, unknown> = { title, content }
  if (imageUrls !== undefined) update.image_urls = imageUrls

  const { error } = await supabase
    .from('posts')
    .update(update)
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) return { error: 'Error al actualizar la publicación.' }

  revalidatePath(`/post/${postId}`)
  redirect(`/post/${postId}`)
}

export async function incrementViewCount(postId: string) {
  const supabase = await createClient()
  await supabase.rpc('increment_view_count', { post_id: postId })
}

export async function togglePinPost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return { error: 'No autorizado' }

  const { data: post } = await supabase
    .from('posts')
    .select('is_pinned, categories(slug)')
    .eq('id', postId)
    .single()
  if (!post) return { error: 'No encontrado' }

  await supabase
    .from('posts')
    .update({ is_pinned: !(post.is_pinned ?? false) })
    .eq('id', postId)

  const slug = (post.categories as unknown as { slug: string }).slug
  revalidatePath('/')
  revalidatePath(`/c/${slug}`)
  revalidatePath(`/post/${postId}`)
  return { success: true }
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const { data: post } = await supabase
    .from('posts')
    .select('user_id, categories(slug)')
    .eq('id', postId)
    .single()

  if (!post) return { error: 'Publicación no encontrada.' }

  const isOwner = post.user_id === user.id
  const isAdmin = profile?.is_admin

  if (!isOwner && !isAdmin) return { error: 'Sin permiso para eliminar.' }

  await supabase
    .from('posts')
    .update({ is_deleted: true })
    .eq('id', postId)

  const slug = (post.categories as unknown as { slug: string }).slug
  revalidatePath('/')
  revalidatePath(`/c/${slug}`)
  redirect(`/c/${slug}`)
}

export async function votePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Debes iniciar sesión para votar.' }

  const { data: existing } = await supabase
    .from('post_votes')
    .select('id, vote_type')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  if (existing) {
    await supabase
      .from('post_votes')
      .delete()
      .eq('id', existing.id)
  } else {
    await supabase
      .from('post_votes')
      .insert({ user_id: user.id, post_id: postId, vote_type: 1 })
  }

  revalidatePath(`/post/${postId}`)
  return { success: true }
}
