import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { wordpressAPI } from '@/lib/wordpress-api'
import type { SurveyData } from './SurveyPage'

interface SurveyFormProps {
  initialData: SurveyData
  onSubmit: (data: SurveyData) => void
  onBack: () => void
}

export const SurveyForm = ({ initialData, onSubmit, onBack }: SurveyFormProps) => {
  const [formData, setFormData] = useState<SurveyData>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const totalSteps = 5

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 1:
        if (!formData.useCase) {
          newErrors.useCase = 'Please select a use case'
        }
        if (formData.useCase === 'other' && !formData.useCaseOther) {
          newErrors.useCaseOther = 'Please specify your use case'
        }
        break
      case 2:
        if (!formData.projectTimeline) {
          newErrors.projectTimeline = 'Please select a project timeline'
        }
        break
      case 3:
        if (!formData.primaryChallenge) {
          newErrors.primaryChallenge = 'Please select your primary challenge'
        }
        if (formData.primaryChallenge === 'other' && !formData.primaryChallengeOther) {
          newErrors.primaryChallengeOther = 'Please specify your challenge'
        }
        break
      case 4:
        if (!formData.purchaseInterest) {
          newErrors.purchaseInterest = 'Please select your interest level'
        }
        break
      case 5:
        // Email is optional, no validation needed
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
        setErrors({})
      } else {
        handleSubmit()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    } else {
      onBack()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const result = await wordpressAPI.submitSurvey(formData)

      if (result.success) {
        await wordpressAPI.markSurveyCompleted()
        onSubmit(formData)
      } else {
        setErrors({ submit: result.message || 'Failed to submit survey' })
      }
    } catch (error) {
      console.error('Survey submission error:', error)
      onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof SurveyData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const useCaseOptions = [
    { value: 'mobile-app', label: 'Mobile app backend (iOS/Android)' },
    { value: 'headless-wp', label: 'Headless WordPress (React/Vue/Next.js)' },
    { value: 'woocommerce', label: 'WooCommerce API integration' },
    { value: 'custom-dashboard', label: 'Custom dashboard/portal' },
    { value: 'testing', label: 'Still testing/exploring' },
    { value: 'other', label: 'Other' },
  ]

  const timelineOptions = [
    { value: 'live', label: "It's already live" },
    { value: 'this-month', label: 'Launching this month' },
    { value: 'next-months', label: 'Next 2-3 months' },
    { value: 'experimenting', label: 'Just experimenting' },
  ]

  const challengeOptions = [
    { value: 'token-tracking', label: "Can't track active tokens/users" },
    { value: 'token-refresh', label: 'Need token refresh capability' },
    { value: 'token-revocation', label: 'Need token revocation system' },
    { value: 'token-analytics', label: 'Need token traceability and history' },
    { value: 'no-issues', label: 'No issues - it works fine' },
    { value: 'other', label: 'Other' },
  ]

  const purchaseOptions = [
    { value: 'very-interested', label: 'Very interested - tell me more' },
    { value: 'interested-specific', label: 'Interested if it solves my specific need' },
    { value: 'maybe-later', label: 'Maybe later when project is further along' },
    { value: 'happy-free', label: 'Happy with free version' },
  ]

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderUseCase()
      case 2:
        return renderTimeline()
      case 3:
        return renderChallenge()
      case 4:
        return renderPurchaseInterest()
      case 5:
        return renderEmailCollection()
      default:
        return null
    }
  }

  const renderUseCase = () => (
    <Card className="jwt-p-8">
      <div className="jwt-space-y-6">
        <div>
          <h2 className="jwt-text-xl jwt-font-semibold jwt-text-gray-900 jwt-mb-2">
            What are you building with JWT Authentication?
          </h2>
          <p className="jwt-text-gray-600">Help us understand your primary use case</p>
        </div>
        <div className="jwt-space-y-4">
          {useCaseOptions.map(option => (
            <label
              key={option.value}
              htmlFor={`useCase-${option.value}`}
              className={`jwt-flex jwt-items-center jwt-space-x-4 jwt-p-4 jwt-border jwt-rounded-lg jwt-cursor-pointer jwt-transition-colors ${
                formData.useCase === option.value
                  ? 'jwt-border-blue-500 jwt-bg-blue-50 jwt-ring-1 jwt-ring-blue-500'
                  : 'jwt-border-gray-200 hover:jwt-bg-gray-50 hover:jwt-border-gray-300'
              }`}
            >
              <input
                type="radio"
                id={`useCase-${option.value}`}
                name="useCase"
                value={option.value}
                checked={formData.useCase === option.value}
                onChange={e => handleInputChange('useCase', e.target.value)}
                className="jwt-h-5 jwt-w-5 jwt-text-blue-600 jwt-focus:ring-blue-500 jwt-border-gray-300"
              />
              <span className="jwt-text-base jwt-text-gray-900 jwt-font-medium">
                {option.label}
              </span>
            </label>
          ))}
          {formData.useCase === 'other' && (
            <div className="jwt-ml-9">
              <Textarea
                placeholder="Please specify your use case..."
                value={formData.useCaseOther || ''}
                onChange={e => handleInputChange('useCaseOther', e.target.value)}
                className="jwt-mt-2"
                rows={2}
              />
            </div>
          )}
        </div>
        {errors.useCase && <p className="jwt-text-sm jwt-text-red-600">{errors.useCase}</p>}
        {errors.useCaseOther && (
          <p className="jwt-text-sm jwt-text-red-600">{errors.useCaseOther}</p>
        )}
      </div>
    </Card>
  )

  const renderTimeline = () => (
    <Card className="jwt-p-8">
      <div className="jwt-space-y-6">
        <div>
          <h2 className="jwt-text-xl jwt-font-semibold jwt-text-gray-900 jwt-mb-2">
            What's your project timeline?
          </h2>
        </div>
        <div className="jwt-space-y-4">
          {timelineOptions.map(option => (
            <label
              key={option.value}
              htmlFor={`timeline-${option.value}`}
              className={`jwt-flex jwt-items-center jwt-space-x-4 jwt-p-4 jwt-border jwt-rounded-lg jwt-cursor-pointer jwt-transition-colors ${
                formData.projectTimeline === option.value
                  ? 'jwt-border-blue-500 jwt-bg-blue-50 jwt-ring-1 jwt-ring-blue-500'
                  : 'jwt-border-gray-200 hover:jwt-bg-gray-50 hover:jwt-border-gray-300'
              }`}
            >
              <input
                type="radio"
                id={`timeline-${option.value}`}
                name="projectTimeline"
                value={option.value}
                checked={formData.projectTimeline === option.value}
                onChange={e => handleInputChange('projectTimeline', e.target.value)}
                className="jwt-h-5 jwt-w-5 jwt-text-blue-600 jwt-focus:ring-blue-500 jwt-border-gray-300"
              />
              <span className="jwt-text-base jwt-text-gray-900 jwt-font-medium">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        {errors.projectTimeline && (
          <p className="jwt-text-sm jwt-text-red-600">{errors.projectTimeline}</p>
        )}
      </div>
    </Card>
  )

  const renderChallenge = () => (
    <Card className="jwt-p-8">
      <div className="jwt-space-y-6">
        <div>
          <h2 className="jwt-text-xl jwt-font-semibold jwt-text-gray-900 jwt-mb-2">
            What's your biggest challenge with JWT Authentication?
          </h2>
        </div>
        <div className="jwt-space-y-4">
          {challengeOptions.map(option => (
            <label
              key={option.value}
              htmlFor={`challenge-${option.value}`}
              className={`jwt-flex jwt-items-center jwt-space-x-4 jwt-p-4 jwt-border jwt-rounded-lg jwt-cursor-pointer jwt-transition-colors ${
                formData.primaryChallenge === option.value
                  ? 'jwt-border-blue-500 jwt-bg-blue-50 jwt-ring-1 jwt-ring-blue-500'
                  : 'jwt-border-gray-200 hover:jwt-bg-gray-50 hover:jwt-border-gray-300'
              }`}
            >
              <input
                type="radio"
                id={`challenge-${option.value}`}
                name="primaryChallenge"
                value={option.value}
                checked={formData.primaryChallenge === option.value}
                onChange={e => handleInputChange('primaryChallenge', e.target.value)}
                className="jwt-h-5 jwt-w-5 jwt-text-blue-600 jwt-focus:ring-blue-500 jwt-border-gray-300"
              />
              <span className="jwt-text-base jwt-text-gray-900 jwt-font-medium">
                {option.label}
              </span>
            </label>
          ))}
          {formData.primaryChallenge === 'other' && (
            <div className="jwt-ml-9">
              <Textarea
                placeholder="Please describe your challenge..."
                value={formData.primaryChallengeOther || ''}
                onChange={e => handleInputChange('primaryChallengeOther', e.target.value)}
                className="jwt-mt-2"
                rows={2}
              />
            </div>
          )}
        </div>
        {errors.primaryChallenge && (
          <p className="jwt-text-sm jwt-text-red-600">{errors.primaryChallenge}</p>
        )}
        {errors.primaryChallengeOther && (
          <p className="jwt-text-sm jwt-text-red-600">{errors.primaryChallengeOther}</p>
        )}
      </div>
    </Card>
  )

  const renderPurchaseInterest = () => (
    <Card className="jwt-p-8">
      <div className="jwt-space-y-6">
        <div>
          <h2 className="jwt-text-xl jwt-font-semibold jwt-text-gray-900 jwt-mb-2">
            JWT Auth Pro includes advanced features starting at $59/year
          </h2>
          <p className="jwt-text-gray-600">
            Features include token refresh, active token tracking, multiple algorithms (RS256,
            ES256), and usage analytics. How interested are you in upgrading?
          </p>
        </div>
        <div className="jwt-space-y-4">
          {purchaseOptions.map(option => (
            <label
              key={option.value}
              htmlFor={`purchase-${option.value}`}
              className={`jwt-flex jwt-items-center jwt-space-x-4 jwt-p-4 jwt-border jwt-rounded-lg jwt-cursor-pointer jwt-transition-colors ${
                formData.purchaseInterest === option.value
                  ? 'jwt-border-blue-500 jwt-bg-blue-50 jwt-ring-1 jwt-ring-blue-500'
                  : 'jwt-border-gray-200 hover:jwt-bg-gray-50 hover:jwt-border-gray-300'
              }`}
            >
              <input
                type="radio"
                id={`purchase-${option.value}`}
                name="purchaseInterest"
                value={option.value}
                checked={formData.purchaseInterest === option.value}
                onChange={e => handleInputChange('purchaseInterest', e.target.value)}
                className="jwt-h-5 jwt-w-5 jwt-text-blue-600 jwt-focus:ring-blue-500 jwt-border-gray-300"
              />
              <span className="jwt-text-base jwt-text-gray-900 jwt-font-medium">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        {errors.purchaseInterest && (
          <p className="jwt-text-sm jwt-text-red-600">{errors.purchaseInterest}</p>
        )}
      </div>
    </Card>
  )

  const renderEmailCollection = () => (
    <Card className="jwt-p-8">
      <div className="jwt-space-y-6">
        <div>
          <h2 className="jwt-text-xl jwt-font-semibold jwt-text-gray-900 jwt-mb-2">
            Get 15% off JWT Auth PRO (Optional)
          </h2>
          <p className="jwt-text-gray-600">
            Enter your email to receive your discount code instantly. We'll also send you helpful
            JWT guides and tips as we create them.
          </p>
        </div>
        <div className="jwt-space-y-4">
          <div>
            <Input
              type="email"
              placeholder="your@email.com"
              value={formData.email || ''}
              onChange={e => handleInputChange('email', e.target.value)}
              className="jwt-max-w-md jwt-h-12 jwt-text-base"
            />
          </div>
          {formData.email && (
            <div className="jwt-flex jwt-items-start jwt-space-x-3 jwt-p-4 jwt-bg-blue-50 jwt-border jwt-border-blue-200 jwt-rounded-lg">
              <input
                type="checkbox"
                id="emailConsent"
                checked={formData.emailConsent || false}
                onChange={e => handleInputChange('emailConsent', e.target.checked)}
                className="jwt-mt-0.5 jwt-h-4 jwt-w-4 jwt-text-blue-600 jwt-focus:ring-blue-500 jwt-border-gray-300 jwt-rounded jwt-flex-shrink-0"
              />
              <Label htmlFor="emailConsent" className="jwt-text-sm jwt-text-blue-900">
                Send me the 15% discount code for JWT Auth PRO and helpful JWT guides
              </Label>
            </div>
          )}
        </div>
      </div>
    </Card>
  )

  return (
    <div className="jwt-max-w-4xl jwt-mx-auto jwt-space-y-8">
      {/* Header */}
      <div className="jwt-text-center jwt-space-y-4">
        <h1 className="jwt-text-3xl jwt-font-bold jwt-text-gray-900">JWT Authentication Survey</h1>
        <p className="jwt-text-lg jwt-text-gray-600">Your feedback helps us improve our product.</p>
      </div>

      {/* Progress Bar */}
      <div className="jwt-bg-white jwt-rounded-lg jwt-p-6 jwt-shadow-sm">
        <div className="jwt-flex jwt-items-center jwt-justify-between jwt-mb-4">
          <span className="jwt-text-sm jwt-font-medium jwt-text-gray-700">
            Question {currentStep} of {totalSteps}
          </span>
          <span className="jwt-text-sm jwt-text-gray-500">2 minutes</span>
        </div>
        <div className="jwt-w-full jwt-bg-gray-200 jwt-rounded-full jwt-h-2">
          <div
            className="jwt-bg-blue-600 jwt-h-2 jwt-rounded-full jwt-transition-all jwt-duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Step */}
      {renderStep()}

      {/* Navigation Buttons */}
      <div className="jwt-bg-white jwt-rounded-lg jwt-p-6 jwt-shadow-sm">
        <div className="jwt-flex jwt-justify-between jwt-items-center">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            className="jwt-flex jwt-items-center jwt-gap-2"
          >
            <ArrowLeft className="jwt-h-4 jwt-w-4" />
            {currentStep === 1 ? 'Back' : 'Previous'}
          </Button>

          {errors.submit && <p className="jwt-text-sm jwt-text-red-600">{errors.submit}</p>}

          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="jwt-flex jwt-items-center jwt-gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="jwt-h-4 jwt-w-4 jwt-animate-spin" />
                Submitting...
              </>
            ) : currentStep === totalSteps ? (
              <>
                Complete Survey
                <ArrowRight className="jwt-h-4 jwt-w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="jwt-h-4 jwt-w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
