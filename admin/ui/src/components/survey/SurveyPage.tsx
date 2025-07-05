import { useState } from 'react'
import { ConsentFlow } from './ConsentFlow'
import { SurveyForm } from './SurveyForm'
import { SuccessFlow } from './SuccessFlow'

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

  return <div className="jwt-space-y-8">{renderStep()}</div>
}
