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
    <InfoCard
      title="Help Improve JWT Authentication (Optional)"
      description="Anonymous Usage Sharing"
    >
      <div className="jwt-flex jwt-items-start jwt-justify-between jwt-gap-4">
        <div className="jwt-flex-1">
          <p className="jwt-text-sm jwt-font-medium jwt-text-slate-700 jwt-mb-2">
            Enable Anonymous Sharing
          </p>
          <p className="jwt-text-sm jwt-text-slate-500">
            Help us build features you actually need by sharing non-sensitive data like PHP/WP
            versions and plugin status.
          </p>
        </div>
        <Switch checked={shareData} onCheckedChange={handleToggle} />
      </div>
    </InfoCard>
  )
}
