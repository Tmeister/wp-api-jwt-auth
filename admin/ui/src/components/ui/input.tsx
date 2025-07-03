import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'jwt-flex jwt-h-9 jwt-w-full jwt-rounded-md jwt-border jwt-border-input jwt-bg-transparent jwt-px-3 jwt-py-1 jwt-text-base jwt-shadow-sm jwt-transition-colors file:jwt-border-0 file:jwt-bg-transparent file:jwt-text-sm file:jwt-font-medium file:jwt-text-foreground placeholder:jwt-text-muted-foreground focus-visible:jwt-outline-none focus-visible:jwt-ring-1 focus-visible:jwt-ring-ring disabled:jwt-cursor-not-allowed disabled:jwt-opacity-50 md:jwt-text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
