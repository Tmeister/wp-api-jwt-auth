import { Button } from '@/components/ui/button'
import { Rocket, BarChart3, Sparkles } from 'lucide-react'
import { buildProUrl, formatCompactTokenCount, getTokenUsageCta } from '@/lib/utils'

interface TopbarProps {
  currentPage: 'overview' | 'survey' | 'token-dashboard'
  onPageChange: (page: 'overview' | 'survey' | 'token-dashboard') => void
  shouldShowUpsell: boolean
  tokensCreated: number
}

export const Topbar = ({
  currentPage,
  onPageChange,
  shouldShowUpsell,
  tokensCreated,
}: TopbarProps) => {
  const { message: ctaMessage, variant } = getTokenUsageCta()
  const compactTokens = formatCompactTokenCount(tokensCreated)
  const proUrl = buildProUrl({
    source: 'dashboard',
    medium: 'header',
    campaign: 'pro-upgrade',
    content: `token-usage-variant-${variant}`,
  })

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
              {shouldShowUpsell && (
                <button
                  onClick={() => onPageChange('token-dashboard')}
                  className={`jwt-flex jwt-items-center jwt-space-x-2 jwt-px-3 jwt-py-2 jwt-rounded-md jwt-text-sm jwt-font-medium jwt-transition-colors ${
                    currentPage === 'token-dashboard'
                      ? 'jwt-bg-green-100 jwt-text-green-700'
                      : 'jwt-text-slate-600 hover:jwt-text-slate-900 hover:jwt-bg-slate-100'
                  }`}
                >
                  <span className="jwt-text-base">👑</span>
                  <span>Token Dashboard</span>
                </button>
              )}
            </nav>
          </div>

          <div className="jwt-flex jwt-items-center jwt-space-x-3">
            {shouldShowUpsell && (
              <>
                <a
                  href={proUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="jwt-hidden lg:jwt-flex jwt-items-center jwt-gap-2 jwt-rounded-lg jwt-border jwt-border-emerald-200 jwt-bg-gradient-to-r jwt-from-emerald-50 jwt-to-lime-50 jwt-px-3 jwt-py-1.5 jwt-shadow-sm hover:jwt-shadow-md jwt-transition-shadow"
                >
                  <span className="jwt-inline-flex jwt-items-center jwt-justify-center jwt-h-5 jwt-w-5 jwt-rounded-full jwt-bg-emerald-500/15 jwt-text-emerald-700">
                    <Sparkles className="jwt-h-3 jwt-w-3" />
                  </span>
                  <span className="jwt-text-xs jwt-font-semibold jwt-text-emerald-800">
                    {compactTokens} tokens generated
                  </span>
                  <span className="jwt-text-xs jwt-text-emerald-700">- {ctaMessage}</span>
                </a>

                <Button
                  className="jwt-bg-emerald-600 hover:jwt-bg-emerald-500 jwt-text-white hover:jwt-text-white jwt-shadow-sm hover:jwt-shadow-md"
                  asChild
                >
                  <a href={proUrl} target="_blank" rel="noopener noreferrer">
                    See token details →
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
