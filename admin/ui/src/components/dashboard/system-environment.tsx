import { Loader2, X } from 'lucide-react'
import { InfoCard } from '@/components/ui/info-card'
import { StatusRow } from '@/components/ui/status-row'
import { Check } from '@/components/ui/check-icon'
import type { ConfigurationStatus } from '@/lib/wordpress-api'

interface SystemEnvironmentProps {
  configStatus: ConfigurationStatus | null
  tokensCreated: number
  daysActive: number
}

export const SystemEnvironment = ({
  configStatus,
  tokensCreated,
  daysActive,
}: SystemEnvironmentProps) => {
  if (!configStatus) {
    return (
      <InfoCard title="System Environment Check" description="Loading system information...">
        <div className="jwt-flex jwt-items-center jwt-justify-center jwt-py-8">
          <Loader2 className="jwt-h-6 jwt-w-6 jwt-animate-spin jwt-text-slate-400" />
        </div>
      </InfoCard>
    )
  }

  const { system } = configStatus
  const allCompatible = system.php_compatible
  const trackingPeriodLabel =
    daysActive <= 0 ? 'since today' : daysActive === 1 ? 'since 1 day' : `since ${daysActive} days`

  return (
    <InfoCard
      title="System Environment Check"
      description={
        allCompatible
          ? 'Your server meets all requirements for JWT authentication'
          : 'Some system requirements need attention'
      }
    >
      <StatusRow label="PHP Version">
        <span className="jwt-mr-2">
          {system.php_version} {system.pro_compatible ? '(Pro Compatible)' : '(Update Recommended)'}
        </span>
        {system.php_compatible ? <Check /> : <X className="jwt-h-5 jwt-w-5 jwt-text-red-500" />}
      </StatusRow>
      <StatusRow label="WordPress Version">
        <span className="jwt-mr-2">{system.wordpress_version} (Supported)</span>
        <Check />
      </StatusRow>
      <StatusRow label="Memory Limit">
        <span className="jwt-mr-2">{system.php_memory_limit} (Sufficient)</span>
        <Check />
      </StatusRow>
      <StatusRow label="MySQL Version">
        <span className="jwt-mr-2">{system.mysql_version}</span>
        <Check />
      </StatusRow>
      <StatusRow label={<span className="jwt-font-bold jwt-text-slate-800">Tokens Generated</span>}>
        <span className="jwt-mr-2">
          <span className="jwt-font-bold">{tokensCreated}</span> {trackingPeriodLabel}
        </span>
        <Check />
      </StatusRow>
    </InfoCard>
  )
}
