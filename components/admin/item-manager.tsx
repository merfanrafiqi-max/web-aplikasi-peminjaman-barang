'use client'

import { useState, useTransition } from 'react'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { deleteItem, saveItem } from '@/app/actions/items'
import { Modal } from '@/components/modal'
import { StatusBadge } from '@/components/status-badge'
import { ToastMessage } from '@/components/toast-message'
import { Button } from '@/components/ui/button'
import type { ActionResult, Item } from '@/lib/types'

const inputClass =
  'h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export function ItemManager({ items }: { items: Item[] }) {
  const [editing, setEditing] = useState<Item | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Item | null>(null)
  const [result, setResult] = useState<ActionResult | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function openCreate() {
    setEditing(null)
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(item: Item) {
    setEditing(item)
    setFormError(null)
    setFormOpen(true)
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await saveItem(formData)
      if (res.ok) {
        setFormOpen(false)
        setResult(res)
      } else {
        setFormError(res.message)
      }
    })
  }

  function confirmDelete() {
    if (!deleting) return
    const id = deleting.id
    startTransition(async () => {
      const res = await deleteItem(id)
      setDeleting(null)
      setResult(res)
    })
  }

  return (
    <section aria-labelledby="items-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="items-heading" className="text-lg font-semibold">
            Data Barang
          </h2>
          <p className="text-sm text-muted-foreground">Tambah, ubah, atau hapus inventaris.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus aria-hidden="true" />
          Tambah Barang
        </Button>
      </div>

      <ToastMessage result={result} />

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Nama</th>
                <th scope="col" className="px-4 py-3 font-medium">Kategori</th>
                <th scope="col" className="px-4 py-3 font-medium">Stok</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    Belum ada barang.
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                  <td className="px-4 py-3 tabular-nums">{item.stock}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)}>
                        <Pencil aria-hidden="true" />
                        <span className="sr-only">Edit {item.name}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleting(item)}
                      >
                        <Trash2 aria-hidden="true" />
                        <span className="sr-only">Hapus {item.name}</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Barang' : 'Tambah Barang'}
        description="Status otomatis mengikuti jumlah stok."
      >
        <form action={handleSubmit} className="flex flex-col gap-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="flex flex-col gap-2">
            <label htmlFor="item-name" className="text-sm font-medium">Nama barang</label>
            <input id="item-name" name="name" required minLength={2} maxLength={100} defaultValue={editing?.name} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="item-category" className="text-sm font-medium">Kategori</label>
              <input id="item-category" name="category" required minLength={2} maxLength={50} defaultValue={editing?.category} className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="item-stock" className="text-sm font-medium">Stok</label>
              <input id="item-stock" name="stock" type="number" required min={0} max={10000} step={1} defaultValue={editing?.stock ?? 1} className={inputClass} />
            </div>
          </div>
          {formError && (
            <p role="alert" className="text-sm text-destructive">{formError}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Batal</Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Hapus barang?"
        description={`"${deleting?.name ?? ''}" beserta riwayat peminjamannya akan dihapus permanen.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleting(null)}>Batal</Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={pending}>
            {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
            Hapus
          </Button>
        </div>
      </Modal>
    </section>
  )
}
