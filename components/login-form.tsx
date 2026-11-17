'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Loader2, LogIn, ShieldCheck, User } from 'lucide-react'
import { login, type LoginState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/form-field'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/types'

const ROLES: { value: Role; label: string; description: string; icon: typeof User }[] = [
  { value: 'user', label: 'User', description: 'Pinjam barang', icon: User },
  { value: 'admin', label: 'Admin', description: 'Kelola sistem', icon: ShieldCheck },
]

export function LoginForm() {
  const [role, setRole] = useState<Role>('user')
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {})

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Masuk sebagai</legend>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map(({ value, label, description, icon: Icon }) => (
            <label
              key={value}
              className={cn(
                'flex cursor-pointer flex-col gap-1 rounded-xl border p-3 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
                role === value ? 'border-primary bg-primary/10' : 'hover:bg-muted',
              )}
            >
              <input
                type="radio"
                name="role"
                value={value}
                checked={role === value}
                onChange={() => setRole(value)}
                className="sr-only"
              />
              <Icon
                className={cn('size-5', role === value ? 'text-primary' : 'text-muted-foreground')}
                aria-hidden="true"
              />
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {role === 'user' && (
        <FormField
          id="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="nama@email.com"
        />
      )}

      <FormField
        id="password"
        label="Password"
        type="password"
        required
        autoComplete="current-password"
        placeholder={role === 'admin' ? 'Password admin' : 'Password akun Anda'}
      />

      {state.error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="h-10" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <LogIn aria-hidden="true" />}
        {pending ? 'Memproses...' : 'Masuk'}
      </Button>

      {role === 'user' && (
        <p className="text-center text-sm text-muted-foreground">
          Belum pernah meminjam?{' '}
          <Link href="/daftar" className="font-medium text-primary underline-offset-4 hover:underline">
            Daftar akun
          </Link>
        </p>
      )}
    </form>
  )
}
