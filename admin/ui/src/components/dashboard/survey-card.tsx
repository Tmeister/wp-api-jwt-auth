import { CTACard } from '@/components/ui/cta-card'
import { Button } from '@/components/ui/button'

export const SurveyCard = () => (
  <CTACard
    title="Quick Survey"
    description="Help us understand your needs better (2 minutes)"
    content="Take our quick survey to help us build features you actually need. Your feedback directly influences our roadmap."
    actionLabel="Takes 2 minutes • Anonymous"
    actionElement={
      <Button size="sm" onClick={() => window.open('https://forms.gle/your-survey-link', '_blank')}>
        Take Survey
      </Button>
    }
  />
)
