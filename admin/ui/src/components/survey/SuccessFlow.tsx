import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ExternalLink } from 'lucide-react'

interface SuccessFlowProps {
  discountCode: string
  hasEmail: boolean
  onReset: () => void
}

export const SuccessFlow = ({ discountCode, hasEmail, onReset }: SuccessFlowProps) => {
  const proUrl = `https://jwtauth.pro?utm_source=wp-admin&utm_medium=survey&utm_campaign=upgrade&utm_content=discount-${discountCode}`

  return (
    <Card className="jwt-p-8 jwt-max-w-2xl jwt-mx-auto">
      <div className="jwt-space-y-6">
        <div className="jwt-text-center jwt-space-y-4">
          <div className="jwt-flex jwt-justify-center">
            <CheckCircle className="jwt-h-16 jwt-w-16 jwt-text-green-600" />
          </div>
          <h2 className="jwt-text-2xl jwt-font-semibold jwt-text-gray-900">
            Thank You for Your Feedback!
          </h2>
          <p className="jwt-text-gray-600 jwt-leading-relaxed">
            Your responses help us build better features.{' '}
            {hasEmail
              ? 'Check your email for your 15% discount code for JWT Auth PRO.'
              : 'Consider sharing your email next time to receive 15% off JWT Auth PRO.'}
          </p>
        </div>

        {/* Discount Code Section - Only show if user provided email */}
        {hasEmail && (
          <div className="jwt-bg-gradient-to-r jwt-from-blue-50 jwt-to-purple-50 jwt-border jwt-border-blue-200 jwt-rounded-lg jwt-p-6">
            <div className="jwt-text-center jwt-space-y-4">
              <div className="jwt-space-y-2">
                <p className="jwt-text-lg jwt-font-medium jwt-text-gray-700">
                  Your 15% discount code for JWT Auth PRO has been sent
                </p>
                <p className="jwt-text-sm jwt-text-gray-600">
                  Valid on any JWT Auth PRO subscription plan - check your inbox (and spam folder)
                </p>
              </div>
              <Button asChild className="jwt-w-full jwt-max-w-xs">
                <a
                  href={proUrl}
                  className="jwt-text-white hover:jwt-text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Upgrade to JWT Auth Pro
                  <ExternalLink className="jwt-h-4 jwt-w-4 jwt-ml-2" />
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Pro Features Highlight */}
        <div className="jwt-border jwt-border-gray-200 jwt-rounded-lg jwt-p-6 jwt-bg-gray-50">
          <h3 className="jwt-font-medium jwt-text-gray-900 jwt-mb-3">
            What You Get with JWT Auth Pro:
          </h3>
          <div className="jwt-grid jwt-grid-cols-1 sm:jwt-grid-cols-2 jwt-gap-3">
            <div className="jwt-flex jwt-items-center jwt-space-x-2">
              <div className="jwt-h-2 jwt-w-2 jwt-bg-blue-600 jwt-rounded-full"></div>
              <span className="jwt-text-sm jwt-text-gray-700">Token refresh capability</span>
            </div>
            <div className="jwt-flex jwt-items-center jwt-space-x-2">
              <div className="jwt-h-2 jwt-w-2 jwt-bg-blue-600 jwt-rounded-full"></div>
              <span className="jwt-text-sm jwt-text-gray-700">Active token tracking</span>
            </div>
            <div className="jwt-flex jwt-items-center jwt-space-x-2">
              <div className="jwt-h-2 jwt-w-2 jwt-bg-blue-600 jwt-rounded-full"></div>
              <span className="jwt-text-sm jwt-text-gray-700">
                Multiple algorithms (RS256, ES256)
              </span>
            </div>
            <div className="jwt-flex jwt-items-center jwt-space-x-2">
              <div className="jwt-h-2 jwt-w-2 jwt-bg-blue-600 jwt-rounded-full"></div>
              <span className="jwt-text-sm jwt-text-gray-700">Usage analytics</span>
            </div>
            <div className="jwt-flex jwt-items-center jwt-space-x-2">
              <div className="jwt-h-2 jwt-w-2 jwt-bg-blue-600 jwt-rounded-full"></div>
              <span className="jwt-text-sm jwt-text-gray-700">Priority support</span>
            </div>
            <div className="jwt-flex jwt-items-center jwt-space-x-2">
              <div className="jwt-h-2 jwt-w-2 jwt-bg-blue-600 jwt-rounded-full"></div>
              <span className="jwt-text-sm jwt-text-gray-700">Advanced security features</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="jwt-flex jwt-justify-center jwt-pt-4">
          <Button variant="outline" onClick={onReset} className="jwt-text-sm">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </Card>
  )
}
