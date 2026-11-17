import { AppHeader } from '@/components/app-header'
import { ItemCatalog } from '@/components/user/item-catalog'
import { MyHistory } from '@/components/user/my-history'
import { getItems, getRequestsForUser } from '@/lib/data'
import { requireRole } from '@/lib/session'

export default async function UserPage() {
  const session = await requireRole('user')
  const [items, requests] = await Promise.all([getItems(), getRequestsForUser(session.userId)])

  return (
    <>
      <AppHeader session={session} />
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Halo, {session.name}</h1>
          <p className="text-sm text-muted-foreground">Barang apa yang ingin Anda pinjam hari ini?</p>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <ItemCatalog items={items} />
          <MyHistory requests={requests} />
        </div>
      </main>
    </>
  )
}
