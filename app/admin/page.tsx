import { Boxes, ClipboardList, Clock, PackageCheck } from 'lucide-react'
import { ItemManager } from '@/components/admin/item-manager'
import { RequestTable } from '@/components/admin/request-table'
import { AppHeader } from '@/components/app-header'
import { StatCard } from '@/components/stat-card'
import { getAllRequests, getItems } from '@/lib/data'
import { requireRole } from '@/lib/session'

export default async function AdminPage() {
  const session = await requireRole('admin')
  const [items, requests] = await Promise.all([getItems(), getAllRequests()])

  const totalStock = items.reduce((sum, i) => sum + i.stock, 0)
  const pending = requests.filter((r) => r.status === 'pending').length
  const active = requests.filter((r) => r.status === 'approved').length

  return (
    <>
      <AppHeader session={session} />
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
          <p className="text-sm text-muted-foreground">Kelola barang dan persetujuan peminjaman.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Jenis barang" value={items.length} icon={Boxes} />
          <StatCard label="Total stok" value={totalStock} icon={PackageCheck} />
          <StatCard label="Menunggu persetujuan" value={pending} icon={Clock} />
          <StatCard label="Sedang dipinjam" value={active} icon={ClipboardList} />
        </div>
        <RequestTable requests={requests} />
        <ItemManager items={items} />
      </main>
    </>
  )
}
