import { useState, useEffect } from 'react'
import { Topbar } from './dashboard/topbar'
import { SurveyPage } from './survey/SurveyPage'
import { TokenDashboard } from './dashboard/token-dashboard'
import { AuthenticationStatusOverview } from './dashboard/authentication-status-overview'
import { ConfigurationHealthCheck } from './dashboard/configuration-health-check'
import { SystemEnvironment } from './dashboard/system-environment'
import { LiveApiExplorer } from './dashboard/live-api-explorer'
import { SetupConfiguration } from './dashboard/setup-configuration'
import { HelpImprove } from './dashboard/help-improve'
import { FloatingSurveyCTA } from './dashboard/floating-survey-cta'
import { wordpressAPI, type ConfigurationStatus } from '@/lib/wordpress-api'

export default function Dashboard() {
  const [shareData, setShareData] = useState(false)
  const [configStatus, setConfigStatus] = useState<ConfigurationStatus | null>(null)
  const [isSurveyCtaVisible, setIsSurveyCtaVisible] = useState(false)
  const [shouldShowSurveyCta, setShouldShowSurveyCta] = useState(false)
  const [surveyCompleted, setSurveyCompleted] = useState(false)
  const [isLoadingDismissal, setIsLoadingDismissal] = useState(false)

  // Initialize page based on URL hash, data attribute, or default to overview
  const getInitialPage = (): 'overview' | 'survey' | 'token-dashboard' => {
    // Check if initial page is set via data attribute (for direct page access)
    const container = document.getElementById('jwt-auth-holder')
    const initialPageFromAttribute = container?.getAttribute('data-initial-page')

    if (initialPageFromAttribute === 'token-dashboard') {
      return 'token-dashboard'
    }

    // Check URL hash and params for navigation within the app
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(window.location.search)

    if (hash === 'survey' || params.get('page') === 'survey') {
      return 'survey'
    }
    if (hash === 'token-dashboard' || params.get('page') === 'token-dashboard') {
      return 'token-dashboard'
    }
    return 'overview'
  }

  const [currentPage, setCurrentPage] = useState<'overview' | 'survey' | 'token-dashboard'>(
    getInitialPage
  )

  // Load settings from WordPress on mount
  useEffect(() => {
    let isCancelled = false

    async function loadData() {
      try {
        // Load all dashboard data in a single API call
        const dashboardData = await wordpressAPI.getDashboardData()

        // Only update state if component is still mounted
        if (!isCancelled) {
          setShareData(dashboardData.settings.share_data ?? false)
          setConfigStatus(dashboardData.jwtStatus)
          setSurveyCompleted(dashboardData.surveyStatus.completed ?? false)
          setShouldShowSurveyCta(
            (dashboardData.surveyDismissal.shouldShow ?? false) &&
              !(dashboardData.surveyStatus.completed ?? false)
          )
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load dashboard data:', error)
        }
      }
    }

    loadData()

    // Cleanup function to cancel the effect if component unmounts
    return () => {
      isCancelled = true
    }
  }, [])

  // Listen for hash changes to support back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1)
      if (hash === 'survey' && currentPage !== 'survey') {
        setCurrentPage('survey')
      } else if (hash === 'token-dashboard' && currentPage !== 'token-dashboard') {
        setCurrentPage('token-dashboard')
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
      // Don't show if user shouldn't see it, already completed survey, or if on survey/token-dashboard page
      if (
        !shouldShowSurveyCta ||
        surveyCompleted ||
        currentPage === 'survey' ||
        currentPage === 'token-dashboard'
      )
        return

      // Show/hide survey CTA based on scroll position
      if (scrollPercent >= 50 && !isSurveyCtaVisible) {
        setIsSurveyCtaVisible(true)
      } else if (scrollPercent < 50 && isSurveyCtaVisible) {
        setIsSurveyCtaVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isSurveyCtaVisible, shouldShowSurveyCta, surveyCompleted, currentPage])

  // Handle page navigation with URL updates
  const handlePageChange = (page: 'overview' | 'survey' | 'token-dashboard') => {
    setCurrentPage(page)

    // Update URL hash for deep linking
    if (page === 'survey') {
      window.history.pushState(null, '', '#survey')
    } else if (page === 'token-dashboard') {
      window.history.pushState(null, '', '#token-dashboard')
    } else {
      window.history.pushState(null, '', '#overview')
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'survey':
        return (
          <SurveyPage
            onBackToDashboard={() => handlePageChange('overview')}
            surveyCompleted={surveyCompleted}
          />
        )
      case 'token-dashboard':
        return <TokenDashboard onBackToDashboard={() => handlePageChange('overview')} />
      case 'overview':
      default: {
        const isJwtConfigured = configStatus?.configuration?.secret_key_configured ?? false

        return (
          <div className="jwt-space-y-8">
            <AuthenticationStatusOverview />
            <div className="jwt-grid jwt-grid-cols-1 lg:jwt-grid-cols-2 jwt-gap-8">
              <ConfigurationHealthCheck configStatus={configStatus} />
              {isJwtConfigured ? (
                <SystemEnvironment configStatus={configStatus} />
              ) : (
                <SetupConfiguration />
              )}
            </div>
            {isJwtConfigured && <LiveApiExplorer />}
            <HelpImprove shareData={shareData} setShareData={setShareData} />
          </div>
        )
      }
    }
  }

  return (
    <div className="jwt-flex jwt-flex-col jwt-min-h-screen jwt-bg-gray-50">
      <Topbar currentPage={currentPage} onPageChange={handlePageChange} />
      <main className="jwt-flex-1 jwt-p-6 sm:jwt-p-8 lg:jwt-p-12 jwt-container jwt-mx-auto">
        {renderPage()}
      </main>
      <FloatingSurveyCTA
        isVisible={
          isSurveyCtaVisible &&
          currentPage !== 'survey' &&
          currentPage !== 'token-dashboard' &&
          !isLoadingDismissal
        }
        onClose={async () => {
          setIsLoadingDismissal(true)
          setIsSurveyCtaVisible(false)
          const success = await wordpressAPI.updateSurveyDismissal()
          if (success) {
            setShouldShowSurveyCta(false)
          }
          setIsLoadingDismissal(false)
        }}
        onTakeSurvey={() => handlePageChange('survey')}
      />
    </div>
  )
}
