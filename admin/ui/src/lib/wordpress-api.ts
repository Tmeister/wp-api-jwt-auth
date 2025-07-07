// WordPress API types
declare global {
  interface Window {
    jwtAuthConfig: {
      apiUrl: string
      nonce: string
      siteUrl: string
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

export interface SurveySubmissionData {
  useCase: string
  useCaseOther?: string
  projectTimeline: string
  primaryChallenge: string
  primaryChallengeOther?: string
  purchaseInterest: string
  email?: string
  emailConsent?: boolean
  siteProfile?: {
    phpVersion: string
    wordpressVersion: string
    pluginCount: number
    siteUrl: string
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
  }
  system: {
    php_version: string
    php_compatible: boolean
    pro_compatible: boolean
    wordpress_version: string
    mysql_version: string
    php_memory_limit: string
    post_max_size: string
  }
  jwt: Record<string, never>
  features: {
    token_revocation: boolean
    token_refresh: boolean
    analytics: boolean
    admin_ui: boolean
    multiple_algorithms: boolean
  }
}

export interface DashboardData {
  settings: JwtAuthOptions
  jwtStatus: ConfigurationStatus
  surveyStatus: { completed: boolean; completedAt?: string }
  surveyDismissal: {
    dismissalCount: number
    lastDismissedAt: string | null
    shouldShow: boolean
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

  async submitSurvey(
    surveyData: SurveySubmissionData
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const submissionData = {
        ...surveyData,
        submittedAt: new Date().toISOString(),
      }

      const surveyUrl = this.apiUrl.replace('/admin/settings', '/admin/survey')
      const response = await fetch(surveyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': this.nonce,
        },
        credentials: 'same-origin',
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error submitting survey:', error)
      return { success: false, message: 'Failed to submit survey' }
    }
  }

  async markSurveyCompleted(): Promise<boolean> {
    try {
      const surveyUrl = this.apiUrl.replace('/admin/settings', '/admin/survey/complete')
      const response = await fetch(surveyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': this.nonce,
        },
        credentials: 'same-origin',
        body: JSON.stringify({ completedAt: new Date().toISOString() }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Error marking survey as completed:', error)
      return false
    }
  }

  async updateSurveyDismissal(): Promise<boolean> {
    try {
      const dismissalUrl = this.apiUrl.replace('/admin/settings', '/admin/survey/dismissal')
      const response = await fetch(dismissalUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': this.nonce,
        },
        credentials: 'same-origin',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Error updating survey dismissal:', error)
      return false
    }
  }

  async getDashboardData(): Promise<DashboardData> {
    try {
      const dashboardUrl = this.apiUrl.replace('/admin/settings', '/admin/dashboard')
      const response = await fetch(dashboardUrl, {
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
      console.error('Error fetching dashboard data:', error)
      // Return fallback data structure
      return {
        settings: { share_data: false },
        jwtStatus: {
          configuration: {
            method: 'Manual (via wp-config.php)',
            secret_key_configured: false,
            cors_enabled: false,
            dev_mode: false,
          },
          system: {
            php_version: 'Unknown',
            php_compatible: false,
            pro_compatible: false,
            wordpress_version: 'Unknown',
            mysql_version: 'Unknown',
            php_memory_limit: 'Unknown',
            post_max_size: 'Unknown',
          },
          jwt: {},
          features: {
            token_revocation: false,
            token_refresh: false,
            analytics: false,
            admin_ui: true,
            multiple_algorithms: false,
          },
        },
        surveyStatus: { completed: false },
        surveyDismissal: { dismissalCount: 0, lastDismissedAt: null, shouldShow: true },
      }
    }
  }
}

export const wordpressAPI = new WordPressAPI()
