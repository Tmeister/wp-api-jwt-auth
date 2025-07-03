import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'jwt-flex jwt-min-h-[60px] jwt-w-full jwt-rounded-md jwt-border jwt-border-input jwt-bg-transparent jwt-px-3 jwt-py-2 jwt-text-base jwt-shadow-sm placeholder:jwt-text-muted-foreground focus-visible:jwt-outline-none focus-visible:jwt-ring-1 focus-visible:jwt-ring-ring disabled:jwt-cursor-not-allowed disabled:jwt-opacity-50 md:jwt-text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
