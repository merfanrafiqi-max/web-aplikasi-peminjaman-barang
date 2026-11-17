'use server'

import { redirect } from 'next/navigation'
import { createSession, destroySession, verifyAdminPassword } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuthClient } from '@/lib/supabase/auth-client'

export type LoginState = { error?: string }
export type SignUpState = { error?: string; fields?: { name: string; email: string } }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function signInBorrower(email: string, password: string) {
  const { data, error } = await createAuthClient().auth.signInWithPassword({ email, password })
  if (error || !data.user) return null

  const { data: profile } = await createAdminClient()
    .from('profiles')
    .select('full_name')
    .eq('id', data.user.id)
    .maybeSingle()

  return {
    userId: data.user.id,
    name: profile?.full_name ?? email.split('@')[0],
  }
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const role = formData.get('role')
  const password = String(formData.get('password') ?? '')

  if (role === 'admin') {
    if (!verifyAdminPassword(password)) return { error: 'Password admin salah.' }
    await createSession({ role: 'admin', name: 'Admin' })
    redirect('/admin')
  }

  if (role !== 'user') return { error: 'Pilih role terlebih dahulu.' }

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(email) || !password) return { error: 'Email atau password salah.' }

  const borrower = await signInBorrower(email, password)
  if (!borrower) return { error: 'Email atau password salah.' }

  await createSession({ role: 'user', ...borrower })
  redirect('/user')
}

export async function signUp(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')
  const fields = { name, email }

  if (name.length < 2 || name.length > 50) {
    return { error: 'Nama harus 2 sampai 50 karakter.', fields }
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { error: 'Format email tidak valid.', fields }
  }
  if (password.length < 8 || password.length > 72) {
    return { error: 'Password minimal 8 karakter.', fields }
  }
  if (password !== confirm) {
    return { error: 'Konfirmasi password tidak sama.', fields }
  }

  const { error } = await createAdminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  })

  if (error) {
    const taken = error.code === 'email_exists' || /already/i.test(error.message)
    if (taken) return { error: 'Email ini sudah terdaftar. Silakan masuk.', fields }
    if (error.code === 'weak_password') {
      return { error: 'Password terlalu lemah. Gunakan kombinasi yang lebih kuat.', fields }
    }
    console.error('Sign-up failed:', error.code, error.message)
    return { error: 'Pendaftaran gagal. Coba lagi beberapa saat.', fields }
  }

  const borrower = await signInBorrower(email, password)
  if (!borrower) redirect('/?registered=1')

  await createSession({ role: 'user', ...borrower })
  redirect('/user')
}

export async function logout() {
  await destroySession()
  redirect('/')
}
