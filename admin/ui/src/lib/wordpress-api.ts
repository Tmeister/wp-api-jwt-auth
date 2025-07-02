// WordPress API types
declare global {
  interface Window {
    jwtAuthConfig: {
      apiUrl: string
      nonce: string
      settings: {
        share_data: boolean
      }
    }
  }
}

export interface JwtAuthOptions {
  share_data: boolean
}

// WordPress REST API client for JWT Auth settings
export class WordPressAPI {
  private apiUrl: string
  private nonce: string

  constructor() {
    this.apiUrl = window.jwtAuthConfig?.apiUrl || '/wp-json/wp/v2/settings'
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
}

export const wordpressAPI = new WordPressAPI()