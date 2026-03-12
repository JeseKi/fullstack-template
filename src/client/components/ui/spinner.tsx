import { cn } from '../../lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary',
        className,
      )}
    />
  )
}
