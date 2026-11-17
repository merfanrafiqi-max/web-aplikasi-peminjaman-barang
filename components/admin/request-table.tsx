'use client'

import { useState, useTransition } from 'react'
import { Check, PackageCheck, X } from 'lucide-react'
import { updateRequestStatus } from '@/app/actions/borrow'
import { StatusBadge } from '@/components/status-badge'
import { ToastMessage } from '@/components/toast-message'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ActionResult, BorrowRequest, BorrowStatus } from '@/lib/types'
import { formatDate } from '@/lib/format'

const FILTERS: { value: BorrowStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'returned', label: 'Dikembalikan' },
]

export function RequestTable({ requests }: { requests: BorrowRequest[] }) {
  const [filter, setFilter] = useState<BorrowStatus | 'all'>('all')
  const [result, setResult] = useState<ActionResult | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const visible = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  function act(id: string, next: BorrowStatus) {
    setBusyId(id)
    startTransition(async () => {
      const res = await updateRequestStatus(id, next)
      setResult(res)
      setBusyId(null)
    })
  }

  return (
    <section aria-labelledby="requests-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="requests-heading" className="text-lg font-semibold">
          Riwayat Peminjaman
        </h2>
        <p className="text-sm text-muted-foreground">Setujui, tolak, atau tandai barang kembali.</p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              filter === f.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ToastMessage result={result} />

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Peminjam</th>
                <th scope="col" className="px-4 py-3 font-medium">Barang</th>
                <th scope="col" className="px-4 py-3 font-medium">Tanggal</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    Tidak ada data peminjaman.
                  </td>
                </tr>
              )}
              {visible.map((r) => {
                const busy = busyId === r.id
                return (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{r.user_name}</td>
                    <td className="px-4 py-3">
                      <p>{r.items?.name ?? 'Barang dihapus'}</p>
                      <p className="text-xs text-muted-foreground">{r.items?.category}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {formatDate(r.borrow_date)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {r.status === 'pending' && (
                          <>
                            <Button size="sm" disabled={busy} onClick={() => act(r.id, 'approved')}>
                              <Check aria-hidden="true" />
                              Setujui
                            </Button>
                            <Button size="sm" variant="outline" disabled={busy} onClick={() => act(r.id, 'rejected')}>
                              <X aria-hidden="true" />
                              Tolak
                            </Button>
                          </>
                        )}
                        {r.status === 'approved' && (
                          <Button size="sm" variant="outline" disabled={busy} onClick={() => act(r.id, 'returned')}>
                            <PackageCheck aria-hidden="true" />
                            Dikembalikan
                          </Button>
                        )}
                        {(r.status === 'rejected' || r.status === 'returned') && (
                          <span className="text-xs text-muted-foreground">Selesai</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
