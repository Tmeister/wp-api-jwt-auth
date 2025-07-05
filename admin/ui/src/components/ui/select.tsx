import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

import { cn } from '@/lib/utils'

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'jwt-flex jwt-h-10 jwt-w-full jwt-items-center jwt-justify-between jwt-rounded-md jwt-border jwt-border-slate-200 jwt-bg-white jwt-px-3 jwt-py-2 jwt-text-sm jwt-ring-offset-white placeholder:jwt-text-slate-500 focus:jwt-outline-none focus:jwt-ring-2 focus:jwt-ring-slate-950 focus:jwt-ring-offset-2 disabled:jwt-cursor-not-allowed disabled:jwt-opacity-50',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="jwt-h-4 jwt-w-4 jwt-opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'jwt-flex jwt-cursor-default jwt-items-center jwt-justify-center jwt-py-1',
      className
    )}
    {...props}
  >
    <ChevronUp className="jwt-h-4 jwt-w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'jwt-flex jwt-cursor-default jwt-items-center jwt-justify-center jwt-py-1',
      className
    )}
    {...props}
  >
    <ChevronDown className="jwt-h-4 jwt-w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'jwt-relative jwt-z-50 jwt-max-h-96 jwt-min-w-[8rem] jwt-overflow-hidden jwt-rounded-md jwt-border jwt-border-slate-200 jwt-bg-white jwt-text-slate-950 jwt-shadow-md data-[state=open]:jwt-animate-in data-[state=closed]:jwt-animate-out data-[state=closed]:jwt-fade-out-0 data-[state=open]:jwt-fade-in-0 data-[state=closed]:jwt-zoom-out-95 data-[state=open]:jwt-zoom-in-95 data-[side=bottom]:jwt-slide-in-from-top-2 data-[side=left]:jwt-slide-in-from-right-2 data-[side=right]:jwt-slide-in-from-left-2 data-[side=top]:jwt-slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:jwt-translate-y-1 data-[side=left]:jwt--translate-x-1 data-[side=right]:jwt-translate-x-1 data-[side=top]:jwt--translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'jwt-p-1',
          position === 'popper' &&
            'jwt-h-[var(--radix-select-trigger-height)] jwt-w-full jwt-min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('jwt-py-1.5 jwt-pl-8 jwt-pr-2 jwt-text-sm jwt-font-semibold', className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'jwt-relative jwt-flex jwt-w-full jwt-cursor-default jwt-select-none jwt-items-center jwt-rounded-sm jwt-py-1.5 jwt-pl-8 jwt-pr-2 jwt-text-sm jwt-outline-none focus:jwt-bg-slate-100 focus:jwt-text-slate-900 data-[disabled]:jwt-pointer-events-none data-[disabled]:jwt-opacity-50',
      className
    )}
    {...props}
  >
    <span className="jwt-absolute jwt-left-2 jwt-flex jwt-h-3.5 jwt-w-3.5 jwt-items-center jwt-justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="jwt-h-4 jwt-w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('jwt--mx-1 jwt-my-1 jwt-h-px jwt-bg-slate-100', className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
