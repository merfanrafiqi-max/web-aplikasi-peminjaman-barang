import { cn } from '@/lib/utils'
import type { BorrowStatus, ItemStatus } from '@/lib/types'

const STYLES: Record<BorrowStatus | ItemStatus, { label: string; className: string }> = {
  available: { label: 'Tersedia', className: 'bg-primary/15 text-primary' },
  borrowed: { label: 'Habis dipinjam', className: 'bg-muted text-muted-foreground' },
  pending: { label: 'Menunggu', className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400' },
  approved: { label: 'Disetujui', className: 'bg-primary/15 text-primary' },
  rejected: { label: 'Ditolak', className: 'bg-destructive/15 text-destructive' },
  returned: { label: 'Dikembalikan', className: 'bg-muted text-muted-foreground' },
}

export function StatusBadge({ status }: { status: BorrowStatus | ItemStatus }) {
  const style = STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        style.className,
      )}
    >
      {style.label}
    </span>
  )
}
