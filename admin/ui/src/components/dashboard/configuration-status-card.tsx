import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { StatusItem } from '@/components/ui/status-item'
import type { ConfigurationStatus } from '@/lib/wordpress-api'

interface ConfigurationStatusCardProps {
  configStatus: ConfigurationStatus | null
}

export const ConfigurationStatusCard = ({ configStatus }: ConfigurationStatusCardProps) => (
  <Card className="jwt-bg-white jwt-rounded-xl jwt-shadow-sm">
    <CardHeader>
      <CardTitle className="jwt-text-lg">Current Configuration Status</CardTitle>
      <CardDescription>A detailed look at your JWT setup.</CardDescription>
    </CardHeader>
    <CardContent>
      {configStatus ? (
        <>
          <div className="jwt-mb-4">
            <div className="jwt-flex jwt-items-center jwt-justify-between jwt-pb-3 jwt-border-b-2 jwt-border-slate-200">
              <span className="jwt-text-sm jwt-font-semibold jwt-text-slate-600">
                Configuration
              </span>
              <div className="jwt-flex jwt-items-center jwt-space-x-8">
                <div className="jwt-w-16 jwt-text-center">
                  <span className="jwt-text-xs jwt-font-semibold jwt-text-slate-600">Status</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <StatusItem
              label="Configuration Method"
              value={configStatus.configuration.method}
              warning={!configStatus.configuration.secret_key_configured}
              good={configStatus.configuration.secret_key_configured}
            />
            <StatusItem
              label="Secret Key"
              value={
                configStatus.configuration.secret_key_configured ? 'Configured' : 'Not configured'
              }
              warning={!configStatus.configuration.secret_key_configured}
              good={configStatus.configuration.secret_key_configured}
            />
            <StatusItem
              label="CORS Support"
              value={configStatus.configuration.cors_enabled ? 'Enabled' : 'Disabled'}
              good={configStatus.configuration.cors_enabled}
            />
            <StatusItem
              label="PHP Version"
              value={`${configStatus.system.php_version} ${configStatus.system.pro_compatible ? '(Pro compatible)' : '(Requires PHP 7.4+ for Pro)'}`}
              good={configStatus.system.pro_compatible}
              warning={!configStatus.system.pro_compatible}
            />
            <StatusItem
              label="WordPress Version"
              value={configStatus.system.wordpress_version}
              good={true}
            />
            <StatusItem
              label="MySQL Version"
              value={configStatus.system.mysql_version}
              good={true}
            />
            <StatusItem
              label="PHP Memory Limit"
              value={configStatus.system.php_memory_limit}
              good={true}
            />
            <StatusItem
              label="Post Max Size"
              value={configStatus.system.post_max_size}
              good={true}
            />
            <StatusItem
              label="Active Plugins"
              value={`${configStatus.system.plugin_count} plugins`}
              good={true}
            />
          </div>
        </>
      ) : (
        <div className="jwt-flex jwt-items-center jwt-justify-center jwt-py-8">
          <span className="jwt-text-sm jwt-text-slate-500">Loading configuration status...</span>
        </div>
      )}
    </CardContent>
  </Card>
)
