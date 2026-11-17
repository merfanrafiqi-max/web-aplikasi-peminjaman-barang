export type Role = 'admin' | 'user'

export type Session =
  | { role: 'admin'; name: string }
  | { role: 'user'; name: string; userId: string }

export type ItemStatus = 'available' | 'borrowed'

export type Item = {
  id: string
  name: string
  category: string
  stock: number
  status: ItemStatus
  created_at: string
}

export type BorrowStatus = 'pending' | 'approved' | 'rejected' | 'returned'

export type BorrowRequest = {
  id: string
  item_id: string
  user_name: string
  status: BorrowStatus
  borrow_date: string
  created_at: string
  items: { name: string; category: string } | null
}

export type ActionResult = { ok: true; message: string } | { ok: false; message: string }
