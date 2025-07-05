import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'jwt-inline-flex jwt-h-10 jwt-items-center jwt-justify-center jwt-rounded-md jwt-bg-slate-100 jwt-p-1 jwt-text-slate-500',
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'jwt-inline-flex jwt-items-center jwt-justify-center jwt-whitespace-nowrap jwt-rounded-sm jwt-px-3 jwt-py-1.5 jwt-text-sm jwt-font-medium jwt-ring-offset-white jwt-transition-all focus-visible:jwt-outline-none focus-visible:jwt-ring-2 focus-visible:jwt-ring-slate-950 focus-visible:jwt-ring-offset-2 disabled:jwt-pointer-events-none disabled:jwt-opacity-50 data-[state=active]:jwt-bg-white data-[state=active]:jwt-text-slate-950 data-[state=active]:jwt-shadow-sm',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'jwt-mt-2 jwt-ring-offset-white focus-visible:jwt-outline-none focus-visible:jwt-ring-2 focus-visible:jwt-ring-slate-950 focus-visible:jwt-ring-offset-2',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
