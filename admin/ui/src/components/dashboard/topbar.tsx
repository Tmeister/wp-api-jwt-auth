import { Button } from '@/components/ui/button'
import { LayoutDashboard, Rocket } from 'lucide-react'

type Page = 'overview' | 'go-pro'

interface TopbarProps {
  activePage: Page
  setActivePage: (page: Page) => void
  discount: number
}

export const Topbar = ({ activePage, setActivePage, discount }: TopbarProps) => {
  const navItems = [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }]

  return (
    <header className="jwt-sticky jwt-top-8 jwt-z-20 jwt-bg-white jwt-border-b">
      <div className="jwt-container jwt-mx-auto jwt-px-4">
        <div className="jwt-flex jwt-items-center jwt-justify-between jwt-h-16">
          <div className="jwt-flex jwt-items-center jwt-space-x-8">
            <div className="jwt-flex jwt-items-center jwt-space-x-2">
              <Rocket className="jwt-h-6 jwt-w-6 jwt-text-slate-800" />
              <h1 className="jwt-text-lg jwt-font-semibold jwt-text-slate-800">JWT Auth</h1>
            </div>
            <nav className="jwt-hidden md:jwt-flex jwt-items-center jwt-space-x-1">
              {navItems.map(item => (
                <Button
                  key={item.id}
                  variant={activePage === item.id ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePage(item.id as Page)}
                  className="jwt-font-medium jwt-px-3"
                >
                  <item.icon className="jwt-mr-2 jwt-h-4 jwt-w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
          <div className="jwt-flex jwt-items-center jwt-space-x-4">
            <div className="jwt-hidden sm:jwt-flex jwt-items-center jwt-space-x-2">
              <span className="jwt-text-sm jwt-font-medium jwt-text-slate-600">Your Discount:</span>
              <span className="jwt-text-sm jwt-font-bold jwt-text-emerald-600 jwt-bg-emerald-100 jwt-px-2 jwt-py-1 jwt-rounded-md">
                {discount}% OFF
              </span>
            </div>
            <Button
              className="jwt-bg-emerald-600 hover:jwt-bg-emerald-700"
              onClick={() => setActivePage('go-pro')}
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
