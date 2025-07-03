import React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
    }

    return (
      <label
        className={cn(
          'jwt-relative jwt-inline-flex jwt-items-center jwt-cursor-pointer',
          className
        )}
      >
        <input
          type="checkbox"
          className="jwt-sr-only"
          checked={checked}
          onChange={handleChange}
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            'jwt-relative jwt-w-11 jwt-h-6 jwt-rounded-full jwt-transition-colors jwt-duration-200 jwt-ease-in-out jwt-focus-within:ring-2 jwt-focus-within:ring-offset-2',
            checked
              ? 'jwt-bg-orange-600 jwt-focus-within:ring-orange-500'
              : 'jwt-bg-slate-300 jwt-focus-within:ring-slate-400'
          )}
        >
          <div
            className={cn(
              'jwt-absolute jwt-top-0.5 jwt-left-0.5 jwt-bg-white jwt-border jwt-rounded-full jwt-h-5 jwt-w-5 jwt-transition-transform jwt-duration-200 jwt-ease-in-out jwt-shadow-sm',
              checked
                ? 'jwt-translate-x-5 jwt-border-orange-600'
                : 'jwt-translate-x-0 jwt-border-slate-300'
            )}
          />
        </div>
      </label>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch }
