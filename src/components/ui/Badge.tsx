import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

type BadgeVariant = 'teal' | 'blue' | 'green' | 'warning' | 'error' | 'gray'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  teal:    'bg-teal-100 text-teal-700',
  blue:    'bg-blue-100 text-blue-700',
  green:   'bg-green-100 text-green-600',
  warning: 'bg-amber-100 text-amber-800',
  error:   'bg-red-100 text-red-800',
  gray:    'bg-surface-subtle text-content-secondary',
}

export default function Badge({
  variant = 'teal',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.03em]',
        'px-2.5 py-0.5 rounded-full whitespace-nowrap',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      )}
      {children}
    </span>
  )
}
