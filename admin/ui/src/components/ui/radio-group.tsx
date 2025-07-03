'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'

import { cn } from '@/lib/utils'

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('jwt-grid jwt-gap-2', className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'jwt-aspect-square jwt-h-4 jwt-w-4 jwt-rounded-full jwt-border jwt-border-primary jwt-text-primary jwt-shadow focus:jwt-outline-none focus-visible:jwt-ring-1 focus-visible:jwt-ring-ring disabled:jwt-cursor-not-allowed disabled:jwt-opacity-50',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="jwt-flex jwt-items-center jwt-justify-center">
        <Circle className="jwt-h-3.5 jwt-w-3.5 jwt-fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
