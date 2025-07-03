import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'jwt-inline-flex jwt-items-center jwt-rounded-md jwt-border jwt-px-2.5 jwt-py-0.5 jwt-text-xs jwt-font-semibold jwt-transition-colors focus:jwt-outline-none focus:jwt-ring-2 focus:jwt-ring-ring focus:jwt-ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'jwt-border-transparent jwt-bg-primary jwt-text-primary-foreground jwt-shadow hover:jwt-bg-primary/80',
        secondary:
          'jwt-border-transparent jwt-bg-secondary jwt-text-secondary-foreground hover:jwt-bg-secondary/80',
        destructive:
          'jwt-border-transparent jwt-bg-destructive jwt-text-destructive-foreground jwt-shadow hover:jwt-bg-destructive/80',
        outline: 'jwt-text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
