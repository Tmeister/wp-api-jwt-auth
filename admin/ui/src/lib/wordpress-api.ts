// WordPress API types
declare global {
  interface Window {
    jwtAuthConfig: {
      apiUrl: string
      nonce: string
      settings: {
        share_data: boolean
      }
      siteProfile?: {
        phpVersion: string
        wordpressVersion: string
        isProCompatible: boolean
        isWooCommerceDetected: boolean
        pluginCount: number
        signingAlgorithm: string
      }
    }
  }
}

export interface JwtAuthOptions {
  share_data: boolean
  survey_data?: {
    building_what?: string
    biggest_challenge?: string
    email?: string
  }
}

export interface SiteProfile {
  phpVersion: string
  wordpressVersion: string
  isProCompatible: boolean
  isWooCommerceDetected: boolean
  pluginCount: number
  signingAlgorithm: string
}

export interface ConfigurationStatus {
  configuration: {
    method: string
    secret_key_configured: boolean
    cors_enabled: boolean
    dev_mode: boolean
    htaccess_configured: boolean
  }
  system: {
    php_version: string
    php_compatible: boolean
    pro_compatible: boolean
    wordpress_version: string
    plugin_count: number
    woocommerce_detected: boolean
  }
  jwt: {
    signing_algorithm: string
    supported_algorithms: string[]
    token_management: string
    active_tokens: string
    token_refresh: string
  }
  features: {
    token_revocation: boolean
    token_refresh: boolean
    analytics: boolean
    admin_ui: boolean
    multiple_algorithms: boolean
  }
}

// WordPress REST API client for JWT Auth settings
export class WordPressAPI {
  private apiUrl: string
  private nonce: string

  constructor() {
    this.apiUrl = window.jwtAuthConfig?.apiUrl || '/wp-json/jwt-auth/v1/admin/settings'
    this.nonce = window.jwtAuthConfig?.nonce || ''
  }

  async getSettings(): Promise<JwtAuthOptions> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': this.nonce,
        },
        credentials: 'same-origin',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.jwt_auth_options || { share_data: false }
    } catch (error) {
      console.error('Error fetching settings:', error)
      // Return default settings from window object if API fails
      return window.jwtAuthConfig?.settings || { share_data: false }
    }
  }

  async updateSettings(settings: JwtAuthOptions): Promise<JwtAuthOptions> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': this.nonce,
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          jwt_auth_options: settings,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.jwt_auth_options || settings
    } catch (error) {
      console.error('Error updating settings:', error)
      throw error
    }
  }

  getSiteProfile(): SiteProfile {
    // Get site profile from window object (passed from PHP)
    return (
      window.jwtAuthConfig?.siteProfile || {
        phpVersion: 'Unknown',
        wordpressVersion: 'Unknown',
        isProCompatible: false,
        isWooCommerceDetected: false,
        pluginCount: 0,
        signingAlgorithm: 'HS256',
      }
    )
  }

  async getConfigurationStatus(): Promise<ConfigurationStatus> {
    try {
      const statusUrl = this.apiUrl.replace('/admin/settings', '/admin/status')
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': this.nonce,
        },
        credentials: 'same-origin',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching configuration status:', error)
      // Return fallback data based on site profile
      const siteProfile = this.getSiteProfile()
      return {
        configuration: {
          method: 'Manual (via wp-config.php)',
          secret_key_configured: true,
          cors_enabled: false,
          dev_mode: false,
          htaccess_configured: true,
        },
        system: {
          php_version: siteProfile.phpVersion,
          php_compatible: siteProfile.isProCompatible,
          pro_compatible: siteProfile.isProCompatible,
          wordpress_version: siteProfile.wordpressVersion || 'Unknown',
          plugin_count: siteProfile.pluginCount,
          woocommerce_detected: siteProfile.isWooCommerceDetected,
        },
        jwt: {
          signing_algorithm: siteProfile.signingAlgorithm,
          supported_algorithms: ['HS256'],
          token_management: 'Manual only',
          active_tokens: 'Unknown - enable monitoring',
          token_refresh: 'Disabled (Pro feature)',
        },
        features: {
          token_revocation: false,
          token_refresh: false,
          analytics: false,
          admin_ui: false,
          multiple_algorithms: false,
        },
      }
    }
  }
}

export const wordpressAPI = new WordPressAPI()
