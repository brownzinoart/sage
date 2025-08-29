import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  helperText?: string
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, helperText, label, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-body-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            // Base input styles from design system
            'input-base focus-visible-only',
            // Error state
            {
              'input-error': error,
            },
            className
          )}
          {...props}
        />
        {helperText && (
          <p className={clsx(
            'text-caption',
            error ? 'text-error' : 'text-text-tertiary'
          )}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input