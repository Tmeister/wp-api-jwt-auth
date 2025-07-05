import { useState, useEffect } from 'react'
import { Topbar } from './dashboard/topbar'
import { SurveyPage } from './survey/SurveyPage'
import { AuthenticationStatusOverview } from './dashboard/authentication-status-overview'
import { ConfigurationHealthCheck } from './dashboard/configuration-health-check'
import { SystemEnvironment } from './dashboard/system-environment'
import { LiveApiExplorer } from './dashboard/live-api-explorer'
import { HelpImprove } from './dashboard/help-improve'
import { FloatingSurveyCTA } from './dashboard/floating-survey-cta'
import { wordpressAPI, type ConfigurationStatus } from '@/lib/wordpress-api'

export default function Dashboard() {
  const [shareData, setShareData] = useState(false)
  const [configStatus, setConfigStatus] = useState<ConfigurationStatus | null>(null)
  const [isSurveyCtaVisible, setIsSurveyCtaVisible] = useState(false)
  const [isUserDismissed, setIsUserDismissed] = useState(false)

  // Initialize page based on URL hash or default to overview
  const getInitialPage = (): 'overview' | 'survey' => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(window.location.search)

    if (hash === 'survey' || params.get('page') === 'survey') {
      return 'survey'
    }
    return 'overview'
  }

  const [currentPage, setCurrentPage] = useState<'overview' | 'survey'>(getInitialPage)

  // Load settings from WordPress on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Load both settings and configuration status in parallel
        const [settings, status] = await Promise.all([
          wordpressAPI.getSettings(),
          wordpressAPI.getConfigurationStatus(),
        ])

        setShareData(settings.share_data)
        setConfigStatus(status)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }

    loadData()
  }, [])

  // Listen for hash changes to support back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1)
      if (hash === 'survey' && currentPage !== 'survey') {
        setCurrentPage('survey')
      } else if (hash === 'overview' && currentPage !== 'overview') {
        setCurrentPage('overview')
      } else if (!hash && currentPage !== 'overview') {
        setCurrentPage('overview')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [currentPage])

  // Handle scroll to show/hide survey CTA at 50% scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / documentHeight) * 100
      // Don't show if user manually dismissed it or if on survey page
      if (isUserDismissed || currentPage === 'survey') return

      // Show/hide survey CTA based on scroll position
      if (scrollPercent >= 50 && !isSurveyCtaVisible) {
        setIsSurveyCtaVisible(true)
      } else if (scrollPercent < 50 && isSurveyCtaVisible) {
        setIsSurveyCtaVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isSurveyCtaVisible, isUserDismissed, currentPage])

  // Handle page navigation with URL updates
  const handlePageChange = (page: 'overview' | 'survey') => {
    setCurrentPage(page)

    // Update URL hash for deep linking
    if (page === 'survey') {
      window.history.pushState(null, '', '#survey')
    } else {
      window.history.pushState(null, '', '#overview')
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'survey':
        return <SurveyPage onBackToDashboard={() => handlePageChange('overview')} />
      case 'overview':
      default:
        return (
          <div className="jwt-space-y-8">
            <AuthenticationStatusOverview />
            <div className="jwt-grid jwt-grid-cols-1 lg:jwt-grid-cols-2 jwt-gap-8">
              <ConfigurationHealthCheck configStatus={configStatus} />
              <SystemEnvironment configStatus={configStatus} />
            </div>
            <LiveApiExplorer />
            <HelpImprove shareData={shareData} setShareData={setShareData} />
          </div>
        )
    }
  }

  return (
    <div className="jwt-flex jwt-flex-col jwt-min-h-screen jwt-bg-gray-50">
      <Topbar currentPage={currentPage} onPageChange={handlePageChange} />
      <main className="jwt-flex-1 jwt-p-6 sm:jwt-p-8 lg:jwt-p-12 jwt-container jwt-mx-auto">
        {renderPage()}
      </main>
      <FloatingSurveyCTA
        isVisible={isSurveyCtaVisible && currentPage !== 'survey'}
        onClose={() => {
          setIsSurveyCtaVisible(false)
          setIsUserDismissed(true)
        }}
        onTakeSurvey={() => handlePageChange('survey')}
      />
    </div>
  )
}
