import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth-shell'
import { SignUpForm } from '@/components/sign-up-form'
import { getSession } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Daftar Akun - PinjamBarang',
  description: 'Buat akun peminjam untuk mulai meminjam barang.',
}

export default async function SignUpPage() {
  const session = await getSession()
  if (session) redirect(session.role === 'admin' ? '/admin' : '/user')

  return (
    <AuthShell title="Daftar Akun" subtitle="Buat akun untuk mulai meminjam barang">
      <SignUpForm />
    </AuthShell>
  )
}
