import { PageHeader } from '@/components/ui/page-header'
import { HelpImproveCard } from './help-improve-card'
import { SurveyCard } from './survey-card'
import { ConfigurationStatusCard } from './configuration-status-card'
import { MissingFeaturesCard } from './missing-features-card'
import type { ConfigurationStatus } from '@/lib/wordpress-api'

interface OverviewPageProps {
  shareData: boolean
  setShareData: (val: boolean) => void
  configStatus: ConfigurationStatus | null
}

export const OverviewPage = ({ shareData, setShareData, configStatus }: OverviewPageProps) => (
  <div className="jwt-space-y-8">
    <PageHeader
      title="Dashboard Overview"
      description="A complete summary of your plugin status, limitations, and opportunities."
    />
    <div className="jwt-grid jwt-grid-cols-1 lg:jwt-grid-cols-2 jwt-gap-6">
      <HelpImproveCard shareData={shareData} setShareData={setShareData} />
      <SurveyCard />
    </div>
    <div className="jwt-grid jwt-grid-cols-1 lg:jwt-grid-cols-2 jwt-gap-6">
      <ConfigurationStatusCard configStatus={configStatus} />
      <MissingFeaturesCard />
    </div>
  </div>
)
