'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Correo o contraseña incorrectos.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const username = (formData.get('username') as string).trim().toLowerCase()

  if (username.length < 3 || username.length > 20) {
    return { error: 'El nombre de usuario debe tener entre 3 y 20 caracteres.' }
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return { error: 'Solo letras minúsculas, números y guiones bajos.' }
  }

  // Check username availability
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (existing) {
    return { error: 'Ese nombre de usuario ya está en uso.' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Ese correo electrónico ya está registrado.' }
    }
    return { error: error.message }
  }

  // Si el usuario necesita confirmar el email, mostrar mensaje
  if (data.user && !data.session) {
    return { needsConfirmation: true }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function updateUsername(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const username = (formData.get('username') as string).trim().toLowerCase()

  if (username.length < 3 || username.length > 20) {
    return { error: 'El nombre de usuario debe tener entre 3 y 20 caracteres.' }
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return { error: 'Solo letras minúsculas, números y guiones bajos.' }
  }

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .single()

  if (existing) {
    return { error: 'Ese nombre de usuario ya está en uso.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('id', user.id)

  if (error) return { error: 'Error al actualizar el nombre de usuario.' }

  revalidatePath('/profile')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
