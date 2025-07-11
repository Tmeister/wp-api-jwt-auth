import { Button } from '@/components/ui/button'
import { Rocket, BarChart3 } from 'lucide-react'

interface TopbarProps {
  currentPage: 'overview' | 'survey'
  onPageChange: (page: 'overview' | 'survey') => void
}

export const Topbar = ({ currentPage, onPageChange }: TopbarProps) => {
  const proUrl = `https://jwtauth.pro?utm_source=wp-admin&utm_medium=topbar&utm_campaign=upgrade`

  return (
    <header className="jwt-sticky jwt-top-8 jwt-z-20 jwt-bg-white jwt-border-b">
      <div className="jwt-container jwt-mx-auto jwt-px-4">
        <div className="jwt-flex jwt-items-center jwt-justify-between jwt-h-16">
          <div className="jwt-flex jwt-items-center jwt-space-x-6">
            <div className="jwt-flex jwt-items-center jwt-space-x-2">
              <Rocket className="jwt-h-6 jwt-w-6 jwt-text-slate-800" />
              <h1 className="jwt-text-lg jwt-font-semibold jwt-text-slate-800">JWT Auth</h1>
            </div>

            {/* Navigation */}
            <nav className="jwt-hidden md:jwt-flex jwt-items-center jwt-space-x-4">
              <button
                onClick={() => onPageChange('overview')}
                className={`jwt-flex jwt-items-center jwt-space-x-2 jwt-px-3 jwt-py-2 jwt-rounded-md jwt-text-sm jwt-font-medium jwt-transition-colors ${
                  currentPage === 'overview'
                    ? 'jwt-bg-blue-100 jwt-text-blue-700'
                    : 'jwt-text-slate-600 hover:jwt-text-slate-900 hover:jwt-bg-slate-100'
                }`}
              >
                <BarChart3 className="jwt-h-4 jwt-w-4" />
                <span>Overview</span>
              </button>
            </nav>
          </div>

          <div className="jwt-flex jwt-items-center jwt-space-x-4">
            <Button className="jwt-text-white hover:jwt-text-white/90" asChild>
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
