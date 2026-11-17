'use client'

import { useMemo, useState, useTransition } from 'react'
import { HandHelping, Loader2, Package, Search } from 'lucide-react'
import { borrowItem } from '@/app/actions/borrow'
import { Modal } from '@/components/modal'
import { StatusBadge } from '@/components/status-badge'
import { ToastMessage } from '@/components/toast-message'
import { Button } from '@/components/ui/button'
import { todayISO } from '@/lib/format'
import type { ActionResult, Item } from '@/lib/types'

export function ItemCatalog({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Item | null>(null)
  const [result, setResult] = useState<ActionResult | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q),
    )
  }, [items, query])

  function handleSubmit(formData: FormData) {
    if (!selected) return
    const itemId = selected.id
    const date = String(formData.get('borrow_date') ?? '')
    startTransition(async () => {
      const res = await borrowItem(itemId, date)
      if (res.ok) {
        setSelected(null)
        setResult(res)
      } else {
        setFormError(res.message)
      }
    })
  }

  return (
    <section aria-labelledby="catalog-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="catalog-heading" className="text-lg font-semibold">
            Daftar Barang
          </h2>
          <p className="text-sm text-muted-foreground">Pilih barang lalu ajukan peminjaman.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="search" className="sr-only">Cari barang</label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari barang atau kategori"
            className="h-10 w-full rounded-lg border bg-background pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <ToastMessage result={result} />

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Tidak ada barang yang cocok.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const available = item.stock > 0
            return (
              <li key={item.id} className="flex flex-col gap-4 rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Package className="size-5" aria-hidden="true" />
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-pretty">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <div className="flex items-center justify-between gap-3 border-t pt-3">
                  <p className="text-sm">
                    <span className="font-semibold tabular-nums">{item.stock}</span>{' '}
                    <span className="text-muted-foreground">unit tersisa</span>
                  </p>
                  <Button
                    size="sm"
                    disabled={!available}
                    onClick={() => {
                      setFormError(null)
                      setSelected(item)
                    }}
                  >
                    <HandHelping aria-hidden="true" />
                    Pinjam
                    <span className="sr-only"> {item.name}</span>
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Ajukan Peminjaman"
        description={selected ? `${selected.name} - ${selected.category}` : undefined}
      >
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="borrow_date" className="text-sm font-medium">Tanggal pinjam</label>
            <input
              id="borrow_date"
              name="borrow_date"
              type="date"
              required
              min={todayISO()}
              defaultValue={todayISO()}
              className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Stok berkurang 1 unit saat diajukan dan dikembalikan bila ditolak admin.
          </p>
          {formError && (
            <p role="alert" className="text-sm text-destructive">{formError}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setSelected(null)}>Batal</Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Ajukan
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
