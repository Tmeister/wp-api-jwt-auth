import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { StatusItem } from "@/components/ui/status-item"
import type { ConfigurationStatus } from "@/lib/wordpress-api"

interface ConfigurationStatusCardProps {
  configStatus: ConfigurationStatus | null
}

export const ConfigurationStatusCard = ({ configStatus }: ConfigurationStatusCardProps) => (
  <Card className="jwt-bg-white jwt-rounded-xl jwt-shadow-sm">
    <CardHeader>
      <CardTitle className="jwt-text-lg">Current Configuration Status</CardTitle>
      <CardDescription>A detailed look at your JWT setup.</CardDescription>
    </CardHeader>
    <CardContent className="jwt-divide-y jwt-divide-slate-100">
      {configStatus ? (
        <>
          <StatusItem 
            label="Configuration Method" 
            value={configStatus.configuration.method}
            warning={!configStatus.configuration.secret_key_configured}
            good={configStatus.configuration.secret_key_configured}
          />
          <StatusItem 
            label="Secret Key" 
            value={configStatus.configuration.secret_key_configured ? "Configured" : "Not configured"}
            warning={!configStatus.configuration.secret_key_configured}
            good={configStatus.configuration.secret_key_configured}
          />
          <StatusItem 
            label="CORS Support" 
            value={configStatus.configuration.cors_enabled ? "Enabled" : "Disabled"}
            good={configStatus.configuration.cors_enabled}
          />
          <StatusItem 
            label="Token Management" 
            value={configStatus.jwt.token_management}
            proFeature={!configStatus.features.token_revocation}
          />
          <StatusItem 
            label="Token Refresh" 
            value={configStatus.jwt.token_refresh}
            proFeature={!configStatus.features.token_refresh}
          />
          <StatusItem 
            label="Active Tokens" 
            value={configStatus.jwt.active_tokens}
            warning={configStatus.jwt.active_tokens.includes("Unknown")}
          />
          <StatusItem 
            label="Signing Algorithm" 
            value={`${configStatus.jwt.signing_algorithm} only`}
            warning={configStatus.jwt.supported_algorithms.length === 1}
          />
          <StatusItem
            label="PHP Version"
            value={`${configStatus.system.php_version} ${configStatus.system.pro_compatible ? "(Pro compatible)" : "(Requires PHP 7.4+ for Pro)"}`}
            good={configStatus.system.pro_compatible}
            warning={!configStatus.system.pro_compatible}
          />
          <StatusItem
            label="WordPress Version"
            value={configStatus.system.wordpress_version}
            good={true}
          />
          <StatusItem
            label="Active Plugins"
            value={`${configStatus.system.plugin_count} plugins`}
            good={true}
          />
          {configStatus.system.woocommerce_detected && (
            <StatusItem
              label="WooCommerce"
              value="Detected"
              good={true}
            />
          )}
        </>
      ) : (
        <div className="jwt-flex jwt-items-center jwt-justify-center jwt-py-8">
          <span className="jwt-text-sm jwt-text-slate-500">Loading configuration status...</span>
        </div>
      )}
    </CardContent>
  </Card>
)