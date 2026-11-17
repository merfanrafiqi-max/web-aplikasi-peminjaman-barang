import type { ComponentProps } from 'react'

type FormFieldProps = ComponentProps<'input'> & {
  id: string
  label: string
  hint?: string
}

export function FormField({ id, label, hint, name, ...props }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name ?? id}
        aria-describedby={hintId}
        className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        {...props}
      />
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}
