import { CTACard } from '@/components/ui/cta-card'
import { Button } from '@/components/ui/button'

interface SurveyCardProps {
  onNavigateToSurvey: () => void
}

export const SurveyCard = ({ onNavigateToSurvey }: SurveyCardProps) => (
  <CTACard
    title="Quick Survey"
    description="Help us understand your needs better and get 15% off JWT Auth Pro"
    content="Take our quick survey to help us build features you actually need. Your feedback directly influences our roadmap and you'll get an instant 15% discount code."
    actionLabel="Takes 2 minutes • Get 15% Off"
    actionElement={
      <Button size="sm" onClick={onNavigateToSurvey}>
        Take Survey
      </Button>
    }
  />
)
