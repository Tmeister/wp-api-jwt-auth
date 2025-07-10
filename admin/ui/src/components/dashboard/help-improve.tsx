import { Switch } from '@/components/ui/switch'
import { InfoCard } from '@/components/ui/info-card'
import { wordpressAPI } from '@/lib/wordpress-api'

interface HelpImproveProps {
  shareData: boolean
  setShareData: (value: boolean) => void
}

export const HelpImprove = ({ shareData, setShareData }: HelpImproveProps) => {
  const handleToggle = async (checked: boolean) => {
    try {
      // Update the setting in WordPress
      await wordpressAPI.updateSettings({ share_data: checked })
      // Update local state
      setShareData(checked)
    } catch (error) {
      console.error('Failed to update sharing setting:', error)
      // Could add toast notification here for better UX
    }
  }

  return (
    <InfoCard title="Help Improve JWT Authentication (Optional)" description="">
      <div className="jwt-flex jwt-items-start jwt-justify-between jwt-gap-4">
        <div className="jwt-flex-1">
          <p className="jwt-text-sm jwt-font-medium jwt-text-slate-700 jwt-mb-2">
            Enable Anonymous Sharing
          </p>
          <p className="jwt-text-sm jwt-text-slate-500">
            Help me build better features for your setup. I only collect technical info (PHP/WP
            versions, use case) to improve compatibility and prioritize development.
          </p>
        </div>
        <Switch checked={shareData} onCheckedChange={handleToggle} />
      </div>
    </InfoCard>
  )
}
