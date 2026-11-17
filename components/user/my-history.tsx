import { CalendarDays } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { formatDate } from '@/lib/format'
import type { BorrowRequest } from '@/lib/types'

export function MyHistory({ requests }: { requests: BorrowRequest[] }) {
  return (
    <section aria-labelledby="history-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="history-heading" className="text-lg font-semibold">
          Riwayat Saya
        </h2>
        <p className="text-sm text-muted-foreground">Hanya peminjaman atas nama Anda.</p>
      </div>
      {requests.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Belum ada peminjaman.
        </p>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {requests.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{r.items?.name ?? 'Barang dihapus'}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  {formatDate(r.borrow_date)}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
