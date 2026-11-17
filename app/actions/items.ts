'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/lib/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function parseItem(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const stock = Number(formData.get('stock'))

  if (name.length < 2 || name.length > 100) return { error: 'Nama barang harus 2-100 karakter.' }
  if (category.length < 2 || category.length > 50) return { error: 'Kategori harus 2-50 karakter.' }
  if (!Number.isInteger(stock) || stock < 0 || stock > 10000) {
    return { error: 'Stok harus bilangan bulat 0-10000.' }
  }
  return { value: { name, category, stock } }
}

function refresh() {
  revalidatePath('/admin')
  revalidatePath('/user')
}

export async function saveItem(formData: FormData): Promise<ActionResult> {
  await requireRole('admin')
  const parsed = parseItem(formData)
  if ('error' in parsed) return { ok: false, message: parsed.error! }

  const supabase = createAdminClient()
  const id = String(formData.get('id') ?? '')

  if (id) {
    if (!UUID_RE.test(id)) return { ok: false, message: 'ID barang tidak valid.' }
    const { error } = await supabase.from('items').update(parsed.value).eq('id', id)
    if (error) return { ok: false, message: 'Gagal memperbarui barang.' }
    refresh()
    return { ok: true, message: 'Barang berhasil diperbarui.' }
  }

  const { error } = await supabase.from('items').insert(parsed.value)
  if (error) return { ok: false, message: 'Gagal menambahkan barang.' }
  refresh()
  return { ok: true, message: 'Barang berhasil ditambahkan.' }
}

export async function deleteItem(id: string): Promise<ActionResult> {
  await requireRole('admin')
  if (!UUID_RE.test(id)) return { ok: false, message: 'ID barang tidak valid.' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('items').delete().eq('id', id)
  if (error) return { ok: false, message: 'Gagal menghapus barang.' }
  refresh()
  return { ok: true, message: 'Barang berhasil dihapus.' }
}
