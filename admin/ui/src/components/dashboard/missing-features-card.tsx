import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { FeatureComparisonRow } from '@/components/ui/feature-comparison-row'

export const MissingFeaturesCard = () => (
  <Card className="jwt-bg-white jwt-rounded-xl jwt-shadow-sm">
    <CardHeader>
      <CardTitle className="jwt-text-lg">What You're Missing</CardTitle>
      <CardDescription>A comparison of your current plan vs. Pro.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="jwt-mb-4">
        <div className="jwt-flex jwt-items-center jwt-justify-between jwt-pb-3 jwt-border-b-2 jwt-border-slate-200">
          <span className="jwt-text-sm jwt-font-semibold jwt-text-slate-600">Feature</span>
          <div className="jwt-flex jwt-items-center jwt-space-x-8">
            <div className="jwt-w-12 jwt-text-center">
              <span className="jwt-text-xs jwt-font-semibold jwt-text-slate-600">Free</span>
            </div>
            <div className="jwt-w-12 jwt-text-center">
              <span className="jwt-text-xs jwt-font-semibold jwt-text-emerald-600">Pro</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <FeatureComparisonRow feature="Admin UI for settings" free={false} pro={true} />
        <FeatureComparisonRow feature="Token management dashboard" free={false} pro={true} />
        <FeatureComparisonRow feature="Manual revoke tokens" free={false} pro={true} />
        <FeatureComparisonRow feature="Automatic revoke tokens" free={false} pro={true} />
        <FeatureComparisonRow feature="Token refresh" free={false} pro={true} />
        <FeatureComparisonRow feature="Usage analytics & monitoring" free={false} pro={true} />
        <FeatureComparisonRow feature="Rate limiting protection" free={false} pro={true} />
        <FeatureComparisonRow feature="Premium support" free={false} pro={true} />
        <FeatureComparisonRow feature="Advanced developer tools" free={false} pro={true} />
      </div>
    </CardContent>
  </Card>
)
