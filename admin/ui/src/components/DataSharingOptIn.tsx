import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { wordpressAPI, type JwtAuthOptions } from '@/lib/wordpress-api'

export const DataSharingOptIn: React.FC = () => {
  const [settings, setSettings] = useState<JwtAuthOptions>({ share_data: false })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const currentSettings = await wordpressAPI.getSettings()
      setSettings(currentSettings)
    } catch (error) {
      console.error('Failed to load settings:', error)
      // Use fallback settings from window object
      setSettings(window.jwtAuthConfig?.settings || { share_data: false })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (checked: boolean) => {
    try {
      setIsSaving(true)
      const newSettings = { ...settings, share_data: checked }

      // Optimistic update
      setSettings(newSettings)

      // Save to WordPress
      await wordpressAPI.updateSettings(newSettings)
    } catch (error) {
      console.error('Failed to save settings:', error)
      // Revert on error
      setSettings({ ...settings, share_data: !checked })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="jwt-max-w-4xl jwt-mx-auto jwt-p-6">
      <Card className="jwt-w-full">
        <CardHeader>
          <CardTitle className="jwt-text-2xl jwt-font-bold jwt-text-gray-900">
            Help Me improve JWT Authentication for WP REST API!!
          </CardTitle>
        </CardHeader>
        <CardContent className="jwt-space-y-6">
          <div className="jwt-space-y-4">
            <p className="jwt-text-gray-700 jwt-leading-relaxed">
              Hello there! I'm always working to make the JWT Authentication for WP REST API plugin better for you.
              To do this, I'd like to understand the environment where the plugin is used.
              Could you share the following information with me?
            </p>

            <ul className="jwt-space-y-3 jwt-ml-4">
              <li className="jwt-text-gray-700">
                <strong className="jwt-font-semibold">- PHP Version:</strong>{' '}
                This helps me ensure compatibility and decide when it's time to phase out older versions.
              </li>
              <li className="jwt-text-gray-700">
                <strong className="jwt-font-semibold">- WordPress Version:</strong>{' '}
                Knowing this helps me optimize the plugin for the most common WordPress setups.
              </li>
              <li className="jwt-text-gray-700">
                <strong className="jwt-font-semibold">- WooCommerce Version:</strong>{' '}
                Knowing this helps me to understand if I need to focus more on WooCommerce compatibility.
              </li>
              <li className="jwt-text-gray-700">
                <strong className="jwt-font-semibold">- Activated Plugins Count:</strong>{' '}
                This helps to know the complexity of the WP installs.
              </li>
            </ul>

            <div className="jwt-bg-blue-50 jwt-border jwt-border-blue-200 jwt-rounded-lg jwt-p-4">
              <p className="jwt-text-blue-900 jwt-font-semibold jwt-mb-2">I promise that:</p>
              <ol className="jwt-space-y-2 jwt-ml-4 jwt-text-blue-800">
                <li>I'll only collect the above information.</li>
                <li>Your data will remain confidential and won't be shared with third parties.</li>
                <li>No personal or site information is shared.</li>
                <li>This feature will in no way affect your website's performance.</li>
              </ol>
            </div>

            <p className="jwt-text-gray-700 jwt-leading-relaxed">
              By sharing this information, you're helping me make JWT Authentication for WP REST API even better for everyone.{' '}
              <span className="jwt-font-semibold">Thank you for your trust and support!</span>
            </p>

            <p className="jwt-text-gray-600 jwt-italic">Enrique Chavez.</p>
          </div>

          <div className="jwt-border-t jwt-pt-6">
            {isLoading ? (
              <div className="jwt-flex jwt-items-center jwt-space-x-2">
                <div className="jwt-w-4 jwt-h-4 jwt-border-2 jwt-border-blue-600 jwt-border-t-transparent jwt-rounded-full jwt-animate-spin"></div>
                <span className="jwt-text-gray-600">Loading settings...</span>
              </div>
            ) : (
              <div className="jwt-flex jwt-items-center jwt-justify-between jwt-p-4 jwt-bg-gray-50 jwt-rounded-lg">
                <div className="jwt-flex-1">
                  <p className="jwt-font-medium jwt-text-gray-900">
                    {settings.share_data
                      ? "You are currently sharing data."
                      : "You are not currently sharing data."
                    }
                  </p>
                  <p className="jwt-text-sm jwt-text-gray-600 jwt-mt-1">
                    Click the toggle button to change your preferences.
                  </p>
                </div>
                <Switch
                  checked={settings.share_data}
                  onCheckedChange={handleToggle}
                  disabled={isSaving}
                />
              </div>
            )}

            {isSaving && (
              <p className="jwt-text-sm jwt-text-blue-600 jwt-mt-2">Saving your preferences...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
