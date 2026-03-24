import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-content-secondary tracking-[0.01em]"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            'font-sans text-sm text-content-primary bg-surface-default',
            'border-[1.5px] border-border-subtle rounded-md',
            'px-3.5 py-2.5 w-full outline-none',
            'placeholder:text-content-tertiary',
            'transition-[border-color,box-shadow] duration-150',
            'hover:border-border-default',
            'focus:border-teal-400 focus:shadow-[0_0_0_3px_rgba(31,163,163,0.12)]',
            error && 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.10)]',
            className,
          )}
          {...props}
        />

        {(hint || error) && (
          <p
            className={cn(
              'text-xs',
              error ? 'text-red-600' : 'text-content-tertiary',
            )}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
