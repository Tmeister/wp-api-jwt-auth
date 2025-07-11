import type React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

interface InfoCardProps {
  title: string
  description: string
  children: React.ReactNode
  headerAccessory?: React.ReactNode
  footer?: React.ReactNode
}

export const InfoCard = ({
  title,
  description,
  children,
  headerAccessory,
  footer,
}: InfoCardProps) => (
  <Card className="jwt-bg-white jwt-rounded-xl jwt-shadow-sm jwt-flex jwt-flex-col">
    <CardHeader className="jwt-p-6">
      <div className="jwt-flex jwt-justify-between jwt-items-start jwt-gap-4">
        <div>
          <CardTitle className="jwt-text-lg jwt-font-semibold jwt-text-slate-800 jwt-mb-2">
            {title}
          </CardTitle>
          <CardDescription className="jwt-text-sm jwt-text-slate-600">
            {description}
          </CardDescription>
        </div>
        {headerAccessory && <div className="jwt-flex-shrink-0">{headerAccessory}</div>}
      </div>
    </CardHeader>
    <CardContent className="jwt-flex-grow jwt-p-6 jwt-pt-0">{children}</CardContent>
    {footer && (
      <CardFooter className="jwt-bg-slate-50 jwt-p-6 jwt-rounded-b-xl jwt-border-t">
        {footer}
      </CardFooter>
    )}
  </Card>
)
