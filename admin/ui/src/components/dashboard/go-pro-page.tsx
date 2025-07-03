import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { FeatureComparison } from '@/components/ui/feature-comparison'
import { Sparkles, Users, ThumbsUp } from 'lucide-react'

interface GoProPageProps {
  discount: number
}

export const GoProPage = ({ discount }: GoProPageProps) => {
  const proFeatures = [
    'Full WordPress admin UI for all settings',
    'See every active token and user',
    'Revoke any token instantly',
    'Automatic token refresh keeps users logged in',
    'Complete API analytics dashboard',
    'Multiple algorithms (RS256, ES256, etc.)',
    'Priority support (2-hour response)',
  ]

  return (
    <div className="jwt-max-w-4xl jwt-mx-auto jwt-space-y-8">
      <PageHeader
        title="Unlock the Full Power of JWT Authentication"
        description="Stop editing config files and gain full control over your API security with a powerful admin UI, advanced features, and priority support."
      />
      <Card className="jwt-bg-slate-800 jwt-text-white jwt-overflow-hidden jwt-text-center jwt-p-8 jwt-rounded-xl">
        <Badge
          variant="secondary"
          className="jwt-bg-amber-400 jwt-text-slate-900 jwt-font-bold jwt-text-sm jwt-mb-4"
        >
          {discount}% OFF - Limited Time Offer
        </Badge>
        <h2 className="jwt-text-3xl jwt-font-bold">Upgrade to Pro Now</h2>
        <div className="jwt-flex jwt-items-center jwt-justify-center jwt-space-x-4 jwt-mt-4">
          <span className="jwt-text-4xl jwt-font-bold jwt-text-white">
            ${(59.99 * (1 - discount / 100)).toFixed(2)}/year
          </span>
          <span className="jwt-text-2xl jwt-text-slate-400 jwt-line-through">$59.99</span>
        </div>
        <Button
          size="lg"
          className="jwt-bg-emerald-600 hover:jwt-bg-emerald-700 jwt-text-white jwt-text-lg jwt-font-bold jwt-mt-6 jwt-px-8 jwt-py-6"
        >
          <Sparkles className="jwt-mr-2 jwt-h-5 jwt-w-5" />
          Claim Your {discount}% Discount
        </Button>
        <p className="jwt-text-xs jwt-text-slate-400 jwt-mt-2">
          30-day money-back guarantee. Active in 2 minutes.
        </p>
      </Card>
      <Card className="jwt-bg-white jwt-rounded-xl jwt-shadow-sm">
        <CardHeader>
          <CardTitle className="jwt-text-lg">Pro Features Included</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="jwt-grid jwt-grid-cols-1 md:jwt-grid-cols-2 jwt-gap-x-8 jwt-gap-y-2">
            {proFeatures.map(feature => (
              <FeatureComparison key={feature} feature={feature} isPro={true} />
            ))}
          </ul>
        </CardContent>
      </Card>
      <div className="jwt-grid jwt-grid-cols-1 md:jwt-grid-cols-2 jwt-gap-6 jwt-text-sm">
        <Card className="jwt-flex jwt-items-center jwt-space-x-4 jwt-p-4 jwt-bg-white jwt-rounded-xl jwt-shadow-sm">
          <div className="jwt-bg-blue-100 jwt-p-3 jwt-rounded-full">
            <Users className="jwt-h-6 jwt-w-6 jwt-text-blue-600" />
          </div>
          <div>
            <p className="jwt-font-semibold jwt-text-slate-800">Join 2,847 Pro Users</p>
            <p className="jwt-text-slate-500">12 sites upgraded in the last 24 hours.</p>
          </div>
        </Card>
        <Card className="jwt-flex jwt-items-center jwt-space-x-4 jwt-p-4 jwt-bg-white jwt-rounded-xl jwt-shadow-sm">
          <div className="jwt-bg-emerald-100 jwt-p-3 jwt-rounded-full">
            <ThumbsUp className="jwt-h-6 jwt-w-6 jwt-text-emerald-600" />
          </div>
          <div>
            <p className="jwt-font-semibold jwt-text-slate-800">"A must-have for headless!"</p>
            <p className="jwt-text-slate-500">- Recent Testimonial</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
