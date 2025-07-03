import { CTACard } from '@/components/ui/cta-card'
import { Switch } from '@/components/ui/switch'

interface HelpImproveCardProps {
  shareData: boolean
  setShareData: (val: boolean) => void
}

export const HelpImproveCard = ({ shareData, setShareData }: HelpImproveCardProps) => (
  <CTACard
    title="Help Improve the Plugin"
    description="Enable anonymous sharing for a 15% discount."
    content="Share usage data (PHP/WordPress version, active plugins count - no personal data) to help us build better features."
    actionLabel="Enable Anonymous Sharing"
    actionElement={
      <Switch id="share-data-switch" checked={shareData} onCheckedChange={setShareData} />
    }
  />
)
