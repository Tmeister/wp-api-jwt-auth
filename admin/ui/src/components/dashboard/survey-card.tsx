import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const SurveyCard = () => (
  <div className="jwt-w-full jwt-max-w-2xl">
    <Card className="jwt-bg-white jwt-border jwt-border-slate-200 jwt-rounded-xl jwt-shadow-sm">
      <CardHeader className="jwt-pb-4">
        <CardTitle className="jwt-text-lg jwt-font-semibold jwt-text-slate-900">Quick Survey</CardTitle>
        <CardDescription className="jwt-text-slate-600">Help us understand your needs better (2 minutes)</CardDescription>
      </CardHeader>
      <CardContent className="jwt-pb-4">
        <p className="jwt-text-sm jwt-text-slate-600 jwt-leading-relaxed">
          Take our quick survey to help us build features you actually need. Your feedback directly influences our roadmap.
        </p>
      </CardContent>
      <CardFooter className="jwt-bg-slate-50 jwt-border-t jwt-border-slate-200 jwt-p-4 jwt-rounded-b-xl">
        <div className="jwt-flex jwt-items-center jwt-justify-between jwt-w-full">
          <span className="jwt-text-sm jwt-text-slate-600">
            Takes 2 minutes • Anonymous
          </span>
          <Button 
            size="sm" 
            className="jwt-bg-slate-800 hover:jwt-bg-slate-700"
            onClick={() => window.open('https://forms.gle/your-survey-link', '_blank')}
          >
            Take Survey
          </Button>
        </div>
      </CardFooter>
    </Card>
  </div>
)