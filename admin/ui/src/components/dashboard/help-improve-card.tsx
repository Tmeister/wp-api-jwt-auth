import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface HelpImproveCardProps {
  shareData: boolean
  setShareData: (val: boolean) => void
}

export const HelpImproveCard = ({ shareData, setShareData }: HelpImproveCardProps) => (
  <div className="jwt-w-full jwt-max-w-2xl">
    <Card className="jwt-bg-white jwt-border jwt-border-slate-200 jwt-rounded-xl jwt-shadow-sm">
      <CardHeader className="jwt-pb-4">
        <CardTitle className="jwt-text-lg jwt-font-semibold jwt-text-slate-900">Help Improve the Plugin</CardTitle>
        <CardDescription className="jwt-text-slate-600">Enable anonymous sharing for a 10% discount.</CardDescription>
      </CardHeader>
      <CardContent className="jwt-pb-4">
        <p className="jwt-text-sm jwt-text-slate-600 jwt-leading-relaxed">
          Share usage data (PHP/WordPress version, active plugins count - no personal data) to help us build better
          features.
        </p>
      </CardContent>
      <CardFooter className="jwt-bg-slate-50 jwt-border-t jwt-border-slate-200 jwt-p-4 jwt-rounded-b-xl">
        <div className="jwt-flex jwt-items-center jwt-justify-between jwt-w-full">
          <label htmlFor="share-data-switch" className="jwt-font-medium jwt-text-sm jwt-text-slate-700">
            Enable Anonymous Sharing
          </label>
          <Switch id="share-data-switch" checked={shareData} onCheckedChange={setShareData} />
        </div>
      </CardFooter>
    </Card>
  </div>
)