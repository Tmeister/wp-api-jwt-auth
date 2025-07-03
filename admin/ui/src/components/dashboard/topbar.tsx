import { Button } from '@/components/ui/button'
import { Rocket } from 'lucide-react'

interface TopbarProps {
  discount: number
}

export const Topbar = ({ discount }: TopbarProps) => {
  const proUrl = `https://jwtauth.pro?utm_source=wp-admin&utm_medium=topbar&utm_campaign=upgrade&utm_content=discount-${discount}`

  return (
    <header className="jwt-sticky jwt-top-8 jwt-z-20 jwt-bg-white jwt-border-b">
      <div className="jwt-container jwt-mx-auto jwt-px-4">
        <div className="jwt-flex jwt-items-center jwt-justify-between jwt-h-16">
          <div className="jwt-flex jwt-items-center jwt-space-x-2">
            <Rocket className="jwt-h-6 jwt-w-6 jwt-text-slate-800" />
            <h1 className="jwt-text-lg jwt-font-semibold jwt-text-slate-800">JWT Auth</h1>
          </div>
          <div className="jwt-flex jwt-items-center jwt-space-x-4">
            {discount > 0 && (
              <div className="jwt-hidden sm:jwt-flex jwt-items-center jwt-space-x-2">
                <span className="jwt-text-sm jwt-font-medium jwt-text-slate-600">
                  Your Discount Code:
                </span>
                <span className="jwt-text-sm jwt-font-bold jwt-text-emerald-600 jwt-bg-emerald-100 jwt-px-2 jwt-py-1 jwt-rounded-md">
                  {discount}OFF
                </span>
              </div>
            )}
            <Button className="jwt-bg-emerald-600 hover:jwt-bg-emerald-700" asChild>
              <a href={proUrl} target="_blank" rel="noopener noreferrer">
                Upgrade to Pro
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
