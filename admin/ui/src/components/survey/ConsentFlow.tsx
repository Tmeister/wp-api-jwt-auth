import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Shield, Lock, ExternalLink } from 'lucide-react'

interface ConsentFlowProps {
  onAccept: () => void
}

export const ConsentFlow = ({ onAccept }: ConsentFlowProps) => {
  const [consentGiven, setConsentGiven] = useState(false)

  return (
    <Card className="jwt-p-8 jwt-max-w-2xl jwt-mx-auto">
      <div className="jwt-space-y-6">
        <div className="jwt-text-center jwt-space-y-4">
          <div className="jwt-flex jwt-justify-center">
            <Shield className="jwt-h-12 jwt-w-12 jwt-text-blue-600" />
          </div>
          <h2 className="jwt-text-2xl jwt-font-semibold jwt-text-gray-900">
            Help Us Improve JWT Authentication
          </h2>
          <p className="jwt-text-gray-600 jwt-leading-relaxed">
            Your feedback helps us build features that matter. This quick survey takes 2 minutes and
            you'll get 15% off any JWT Auth PRO subscription.
          </p>
        </div>

        <div className="jwt-bg-blue-50 jwt-border jwt-border-blue-200 jwt-rounded-lg jwt-p-4">
          <div className="jwt-flex jwt-items-start jwt-space-x-3">
            <Lock className="jwt-h-5 jwt-w-5 jwt-text-blue-600 jwt-mt-0.5" />
            <div className="jwt-space-y-2">
              <h3 className="jwt-font-medium jwt-text-blue-900">Data Collection Notice</h3>
              <p className="jwt-text-sm jwt-text-blue-800">
                Your survey responses will be sent to our secure server to help improve the plugin.
              </p>
              <p className="jwt-text-sm jwt-text-blue-800">
                No personal information is required, and email sharing is completely optional.
              </p>
            </div>
          </div>
        </div>

        <div className="jwt-space-y-4">
          <div className="jwt-flex jwt-items-start jwt-space-x-3">
            <input
              type="checkbox"
              id="consent"
              checked={consentGiven}
              onChange={e => setConsentGiven(e.target.checked)}
              className="jwt-h-4 jwt-w-4 jwt-text-blue-600 jwt-focus:ring-blue-500 jwt-border-gray-300 jwt-rounded jwt-flex-shrink-0"
            />
            <Label
              htmlFor="consent"
              className="jwt-text-sm jwt-text-gray-700 jwt-leading-relaxed -jwt-mt-1.5 jwt-cursor-pointer"
            >
              I consent to share my survey responses to help improve JWT Authentication. I
              understand that my data will be transmitted to an external server for analysis.
            </Label>
          </div>

          <p className="jwt-text-xs jwt-text-gray-500 jwt-pl-7">
            By participating, you agree to our{' '}
            <a
              href="https://jwtauth.pro/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="jwt-text-blue-600 jwt-hover:underline jwt-inline-flex jwt-items-center jwt-gap-1"
            >
              Privacy Policy <ExternalLink className="jwt-h-3 jwt-w-3" />
            </a>
          </p>
        </div>

        <div className="jwt-flex jwt-justify-center jwt-pt-4">
          <Button onClick={onAccept} disabled={!consentGiven} className="jwt-px-8 jwt-py-2">
            Start Survey
          </Button>
        </div>
      </div>
    </Card>
  )
}
