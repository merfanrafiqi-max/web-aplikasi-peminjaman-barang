'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/session'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult, BorrowStatus } from '@/lib/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function refresh() {
  revalidatePath('/admin')
  revalidatePath('/user')
}

function isValidBorrowDate(value: string) {
  if (!DATE_RE.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return false
  const dayMs = 24 * 60 * 60 * 1000
  const now = Date.now()
  // Allow one day of slack for timezone differences, and at most 90 days ahead.
  return date.getTime() >= now - 2 * dayMs && date.getTime() <= now + 90 * dayMs
}

export async function borrowItem(itemId: string, borrowDate: string): Promise<ActionResult> {
  const session = await requireRole('user')
  if (!UUID_RE.test(itemId)) return { ok: false, message: 'Barang tidak valid.' }
  if (!isValidBorrowDate(borrowDate)) return { ok: false, message: 'Tanggal pinjam tidak valid.' }

  const supabase = createAdminClient()

  const { data: newStock, error: stockError } = await supabase.rpc('adjust_item_stock', {
    p_item_id: itemId,
    p_delta: -1,
  })
  if (stockError) return { ok: false, message: 'Gagal memproses stok barang.' }
  if (newStock === null) return { ok: false, message: 'Stok barang sudah habis.' }

  const { error: insertError } = await supabase.from('borrow_requests').insert({
    item_id: itemId,
    user_id: session.userId,
    user_name: session.name,
    status: 'pending',
    borrow_date: borrowDate,
  })

  if (insertError) {
    await supabase.rpc('adjust_item_stock', { p_item_id: itemId, p_delta: 1 })
    return { ok: false, message: 'Gagal menyimpan peminjaman.' }
  }

  refresh()
  return { ok: true, message: 'Peminjaman diajukan. Menunggu persetujuan admin.' }
}

const TRANSITIONS: Record<string, { from: BorrowStatus; restock: boolean; message: string }> = {
  approved: { from: 'pending', restock: false, message: 'Peminjaman disetujui.' },
  rejected: { from: 'pending', restock: true, message: 'Peminjaman ditolak, stok dikembalikan.' },
  returned: { from: 'approved', restock: true, message: 'Barang ditandai sudah dikembalikan.' },
}

export async function updateRequestStatus(
  requestId: string,
  next: BorrowStatus,
): Promise<ActionResult> {
  await requireRole('admin')
  if (!UUID_RE.test(requestId)) return { ok: false, message: 'Permintaan tidak valid.' }

  const rule = TRANSITIONS[next]
  if (!rule) return { ok: false, message: 'Status tidak valid.' }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('borrow_requests')
    .update({ status: next })
    .eq('id', requestId)
    .eq('status', rule.from)
    .select('item_id')
    .maybeSingle()

  if (error) return { ok: false, message: 'Gagal memperbarui status.' }
  if (!data) return { ok: false, message: 'Status permintaan sudah berubah. Muat ulang halaman.' }

  if (rule.restock) {
    await supabase.rpc('adjust_item_stock', { p_item_id: data.item_id, p_delta: 1 })
  }

  refresh()
  return { ok: true, message: rule.message }
}
