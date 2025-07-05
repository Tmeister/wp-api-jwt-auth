import { CheckCircle, Loader2, X, AlertTriangle } from 'lucide-react'
import { InfoCard } from '@/components/ui/info-card'
import { StatusRow } from '@/components/ui/status-row'
import { Check } from '@/components/ui/check-icon'
import type { ConfigurationStatus } from '@/lib/wordpress-api'

interface ConfigurationHealthCheckProps {
  configStatus: ConfigurationStatus | null
}

export const ConfigurationHealthCheck = ({ configStatus }: ConfigurationHealthCheckProps) => {
  if (!configStatus) {
    return (
      <InfoCard title="Configuration Health Check" description="Loading configuration status...">
        <div className="jwt-flex jwt-items-center jwt-justify-center jwt-py-8">
          <Loader2 className="jwt-h-6 jwt-w-6 jwt-animate-spin jwt-text-slate-400" />
        </div>
      </InfoCard>
    )
  }

  const { configuration } = configStatus
  const allConfigured = configuration.secret_key_configured

  return (
    <InfoCard
      title="Configuration Health Check"
      description="JWT Configuration Status"
      headerAccessory={
        <div
          className={`jwt-inline-flex jwt-items-center jwt-gap-x-1.5 jwt-rounded-full jwt-px-2.5 jwt-py-1 jwt-text-xs jwt-font-medium ${
            allConfigured
              ? 'jwt-bg-emerald-100 jwt-text-emerald-800'
              : 'jwt-bg-yellow-100 jwt-text-yellow-800'
          }`}
        >
          <span className="jwt-mr-2">{allConfigured ? 'Ready' : 'Needs Attention'}</span>
          {allConfigured ? (
            <CheckCircle className="jwt-h-3.5 jwt-w-3.5 jwt--ml-0.5" />
          ) : (
            <X className="jwt-h-3.5 jwt-w-3.5 jwt--ml-0.5" />
          )}
        </div>
      }
    >
      <StatusRow label="Secret Key">
        <span className="jwt-mr-2">
          {configuration.secret_key_configured ? 'Configured & Valid' : 'Not Configured'}
        </span>
        {configuration.secret_key_configured ? (
          <Check />
        ) : (
          <X className="jwt-h-5 jwt-w-5 jwt-text-red-500" />
        )}
      </StatusRow>
      <StatusRow label="CORS Support">
        <span className="jwt-mr-2">{configuration.cors_enabled ? 'Enabled' : 'Disabled'}</span>
        {configuration.cors_enabled ? (
          <Check />
        ) : (
          <AlertTriangle className="jwt-h-5 jwt-w-5 jwt-text-yellow-500" />
        )}
      </StatusRow>
      <StatusRow label="Authentication Endpoints">
        <span className="jwt-mr-2">
          {configuration.secret_key_configured ? 'Active' : 'Inactive'}
        </span>
        {configuration.secret_key_configured ? (
          <Check />
        ) : (
          <X className="jwt-h-5 jwt-w-5 jwt-text-red-500" />
        )}
      </StatusRow>
      <StatusRow label="Token Standard">
        <span className="jwt-mr-2">RFC 7519 Compliant</span>
        {configuration.secret_key_configured ? (
          <Check />
        ) : (
          <X className="jwt-h-5 jwt-w-5 jwt-text-red-500" />
        )}
      </StatusRow>
      {configuration.secret_key_configured && (
        <StatusRow label="Ready for Integrations">
          <Check />
        </StatusRow>
      )}
    </InfoCard>
  )
}
