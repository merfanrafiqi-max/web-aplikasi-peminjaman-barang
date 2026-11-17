import 'server-only'
import { createAdminClient } from './supabase/admin'
import type { BorrowRequest, Item } from './types'

export async function getItems(): Promise<Item[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('items')
    .select('id, name, category, stock, status, created_at')
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return data as Item[]
}

const REQUEST_COLUMNS =
  'id, item_id, user_name, status, borrow_date, created_at, items(name, category)'

export async function getAllRequests(): Promise<BorrowRequest[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('borrow_requests')
    .select(REQUEST_COLUMNS)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data as unknown as BorrowRequest[]
}

export async function getRequestsForUser(userId: string): Promise<BorrowRequest[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('borrow_requests')
    .select(REQUEST_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data as unknown as BorrowRequest[]
}
