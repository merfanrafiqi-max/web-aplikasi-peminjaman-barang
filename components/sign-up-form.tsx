'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Loader2, UserPlus } from 'lucide-react'
import { signUp, type SignUpState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/form-field'

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<SignUpState, FormData>(signUp, {})

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormField
        id="name"
        label="Nama lengkap"
        required
        minLength={2}
        maxLength={50}
        autoComplete="name"
        placeholder="cth. Budi Santoso"
        defaultValue={state.fields?.name}
      />
      <FormField
        id="email"
        label="Email"
        type="email"
        required
        maxLength={254}
        autoComplete="email"
        placeholder="nama@email.com"
        defaultValue={state.fields?.email}
      />
      <FormField
        id="password"
        label="Password"
        type="password"
        required
        minLength={8}
        maxLength={72}
        autoComplete="new-password"
        placeholder="Minimal 8 karakter"
        hint="Gunakan minimal 8 karakter."
      />
      <FormField
        id="confirm"
        label="Konfirmasi password"
        type="password"
        required
        minLength={8}
        maxLength={72}
        autoComplete="new-password"
        placeholder="Ulangi password"
      />

      {state.error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="h-10" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
        {pending ? 'Mendaftarkan...' : 'Daftar & Masuk'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{' '}
        <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  )
}
