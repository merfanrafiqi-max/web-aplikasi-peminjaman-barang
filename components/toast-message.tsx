import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActionResult } from '@/lib/types'

export function ToastMessage({ result }: { result: ActionResult | null }) {
  if (!result) return null
  return (
    <div
      role="status"
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
        result.ok ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive',
      )}
    >
      {result.ok ? (
        <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
      ) : (
        <XCircle className="size-4 shrink-0" aria-hidden="true" />
      )}
      {result.message}
    </div>
  )
}
