import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-teal-500 text-white shadow-brand hover:bg-teal-600 hover:shadow-[0_6px_20px_rgba(31,163,163,0.32)]',
  secondary:
    'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 hover:border-teal-300',
  ghost:
    'bg-transparent text-content-secondary border border-border-subtle hover:bg-surface-subtle hover:text-content-primary hover:border-border-default',
  danger:
    'bg-red-50 text-red-600 border border-red-300 hover:bg-red-100',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 rounded-md text-[13px]',
  md: 'px-5 py-2.5 rounded-md text-sm',
  lg: 'px-7 py-3 rounded-lg text-[15px]',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // base
          'inline-flex items-center gap-2 font-sans font-medium leading-none',
          'whitespace-nowrap cursor-pointer select-none',
          'transition-[background,box-shadow,transform] duration-150',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          // variant + size
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
export default Button
