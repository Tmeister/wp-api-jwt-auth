import { useState, useEffect } from 'react'
import { ConsentFlow } from './ConsentFlow'
import { SurveyForm } from './SurveyForm'
import { SuccessFlow } from './SuccessFlow'
import { wordpressAPI } from '@/lib/wordpress-api'

export type SurveyStep = 'consent' | 'questions' | 'success'

export interface SurveyData {
  useCase: string
  useCaseOther?: string
  projectTimeline: string
  primaryChallenge: string
  primaryChallengeOther?: string
  purchaseInterest: string
  email?: string
  emailConsent?: boolean
}

interface SurveyPageProps {
  onBackToDashboard?: () => void
}

export const SurveyPage = ({ onBackToDashboard }: SurveyPageProps) => {
  const [currentStep, setCurrentStep] = useState<SurveyStep>('consent')
  const [surveyData, setSurveyData] = useState<SurveyData>({
    useCase: '',
    projectTimeline: '',
    primaryChallenge: '',
    purchaseInterest: '',
  })
  const [discountCode, setDiscountCode] = useState<string>('')
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  // Check if survey is already completed on mount
  useEffect(() => {
    async function checkSurveyStatus() {
      try {
        const status = await wordpressAPI.getSurveyStatus()
        if (status.completed) {
          // If survey is already completed, show the success page
          setDiscountCode('SURVEY15')
          setCurrentStep('success')
        }
      } catch (error) {
        console.error('Failed to check survey status:', error)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    checkSurveyStatus()
  }, [])

  const handleConsentAccept = () => {
    setCurrentStep('questions')
  }

  const handleSurveySubmit = (data: SurveyData) => {
    setSurveyData(data)
    setDiscountCode('SURVEY15')
    setCurrentStep('success')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'consent':
        return <ConsentFlow onAccept={handleConsentAccept} />
      case 'questions':
        return (
          <SurveyForm
            initialData={surveyData}
            onSubmit={handleSurveySubmit}
            onBack={() => setCurrentStep('consent')}
          />
        )
      case 'success':
        return (
          <SuccessFlow
            discountCode={discountCode}
            hasEmail={!!surveyData.email}
            onReset={() => {
              if (onBackToDashboard) {
                onBackToDashboard()
              } else {
                setCurrentStep('consent')
                setSurveyData({
                  useCase: '',
                  projectTimeline: '',
                  primaryChallenge: '',
                  purchaseInterest: '',
                })
                setDiscountCode('')
              }
            }}
          />
        )
      default:
        return null
    }
  }

  if (isCheckingStatus) {
    return (
      <div className="jwt-flex jwt-items-center jwt-justify-center jwt-min-h-[400px]">
        <div className="jwt-text-slate-600">Loading...</div>
      </div>
    )
  }

  return <div className="jwt-space-y-8">{renderStep()}</div>
}
