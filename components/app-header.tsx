import { LogOut, Package, ShieldCheck, User } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import type { Session } from '@/lib/types'

export function AppHeader({ session }: { session: Session }) {
  const isAdmin = session.role === 'admin'
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="size-5" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">PinjamBarang</p>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Panel Admin' : 'Portal Peminjam'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground sm:inline-flex">
            {isAdmin ? (
              <ShieldCheck className="size-3.5" aria-hidden="true" />
            ) : (
              <User className="size-3.5" aria-hidden="true" />
            )}
            {session.name}
          </span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut aria-hidden="true" />
              Keluar
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
