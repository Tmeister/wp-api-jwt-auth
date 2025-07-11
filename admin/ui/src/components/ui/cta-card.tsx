import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import type React from 'react'

interface CTACardProps {
  title: string
  description: string
  content: string
  actionLabel: string
  actionElement: React.ReactNode
  className?: string
}

export const CTACard = ({
  title,
  description,
  content,
  actionLabel,
  actionElement,
  className = '',
}: CTACardProps) => (
  <Card
    className={`jwt-bg-white jwt-border jwt-border-slate-200 jwt-rounded-xl jwt-shadow-sm ${className}`}
  >
    <CardHeader className="jwt-pb-4">
      <CardTitle className="jwt-text-lg jwt-font-semibold jwt-text-slate-900">{title}</CardTitle>
      <CardDescription className="jwt-text-slate-600">{description}</CardDescription>
    </CardHeader>
    <CardContent className="jwt-pb-4">
      <p className="jwt-text-sm jwt-text-slate-600 jwt-leading-relaxed">{content}</p>
    </CardContent>
    <CardFooter className="jwt-bg-slate-50 jwt-border-t jwt-border-slate-200 jwt-p-4 jwt-pt-6 jwt-rounded-b-xl">
      <div className="jwt-flex jwt-items-center jwt-justify-between jwt-w-full jwt-min-h-[32px]">
        <span className="jwt-text-sm jwt-text-slate-900 jwt-flex jwt-items-center jwt-font-semibold">
          {actionLabel}
        </span>
        <div className="jwt-flex jwt-items-center">{actionElement}</div>
      </div>
    </CardFooter>
  </Card>
)
