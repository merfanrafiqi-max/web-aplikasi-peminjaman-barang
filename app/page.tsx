import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth-shell'
import { LoginForm } from '@/components/login-form'
import { getSession } from '@/lib/session'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>
}) {
  const session = await getSession()
  if (session) redirect(session.role === 'admin' ? '/admin' : '/user')
  const { registered } = await searchParams

  return (
    <AuthShell
      title="PinjamBarang"
      subtitle="Sistem peminjaman inventaris"
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Demo admin: <code className="font-mono">admin123</code>
        </p>
      }
    >
      {registered && (
        <p role="status" className="mb-5 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          Akun berhasil dibuat. Silakan masuk.
        </p>
      )}
      <LoginForm />
    </AuthShell>
  )
}
