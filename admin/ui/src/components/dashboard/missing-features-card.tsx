import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FeatureComparison } from "@/components/ui/feature-comparison"

export const MissingFeaturesCard = () => (
  <Card className="jwt-bg-white jwt-rounded-xl jwt-shadow-sm">
    <CardHeader>
      <CardTitle className="jwt-text-lg">What You're Missing</CardTitle>
      <CardDescription>A comparison of your current plan vs. Pro.</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="jwt-space-y-1">
        <FeatureComparison feature="Edit settings only via wp-config.php" isPro={false} />
        <FeatureComparison feature="No visibility into active tokens" isPro={false} />
        <FeatureComparison feature="Can't revoke compromised tokens" isPro={false} />
        <FeatureComparison feature="Full WordPress admin UI for all settings" isPro={true} />
        <FeatureComparison feature="Revoke any token instantly" isPro={true} />
        <FeatureComparison feature="Automatic token refresh" isPro={true} />
      </ul>
    </CardContent>
  </Card>
)