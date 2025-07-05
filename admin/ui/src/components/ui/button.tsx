import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'jwt-inline-flex jwt-items-center jwt-justify-center jwt-gap-2 jwt-whitespace-nowrap jwt-rounded-md jwt-text-sm jwt-font-medium jwt-transition-colors focus-visible:jwt-outline-none focus-visible:jwt-ring-1 focus-visible:jwt-ring-ring disabled:jwt-pointer-events-none disabled:jwt-opacity-50 [&_svg]:jwt-pointer-events-none [&_svg]:jwt-size-4 [&_svg]:jwt-shrink-0',
  {
    variants: {
      variant: {
        default: 'jwt-bg-primary jwt-text-primary-foreground jwt-shadow hover:jwt-bg-primary/90',
        destructive:
          'jwt-bg-destructive jwt-text-destructive-foreground jwt-shadow-sm hover:jwt-bg-destructive/90',
        outline:
          'jwt-border jwt-border-input jwt-bg-background jwt-shadow-sm hover:jwt-bg-accent hover:jwt-text-accent-foreground',
        secondary:
          'jwt-bg-secondary jwt-text-secondary-foreground jwt-shadow-sm hover:jwt-bg-secondary/80',
        ghost: 'hover:jwt-bg-accent hover:jwt-text-accent-foreground',
        link: 'jwt-text-primary jwt-underline-offset-4 hover:jwt-underline',
      },
      size: {
        default: 'jwt-h-9 jwt-px-4 jwt-py-2',
        sm: 'jwt-h-8 jwt-rounded-md jwt-px-3 jwt-text-xs',
        lg: 'jwt-h-10 jwt-rounded-md jwt-px-8',
        icon: 'jwt-h-9 jwt-w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
