import { CheckCircle, XCircle } from 'lucide-react'

interface FeatureComparisonRowProps {
  feature: string
  free: boolean
  pro: boolean
}

export const FeatureComparisonRow = ({ feature, free, pro }: FeatureComparisonRowProps) => (
  <div className="jwt-flex jwt-items-center jwt-justify-between jwt-py-3 jwt-border-b jwt-border-slate-100 last:jwt-border-b-0">
    <span className="jwt-text-sm jwt-text-slate-700">{feature}</span>
    <div className="jwt-flex jwt-items-center jwt-space-x-8">
      <div className="jwt-w-12 jwt-text-center">
        {free ? (
          <CheckCircle className="jwt-h-5 jwt-w-5 jwt-text-emerald-500 jwt-mx-auto" />
        ) : (
          <XCircle className="jwt-h-5 jwt-w-5 jwt-text-slate-400 jwt-mx-auto" />
        )}
      </div>
      <div className="jwt-w-12 jwt-text-center">
        {pro ? (
          <CheckCircle className="jwt-h-5 jwt-w-5 jwt-text-emerald-500 jwt-mx-auto" />
        ) : (
          <XCircle className="jwt-h-5 jwt-w-5 jwt-text-slate-400 jwt-mx-auto" />
        )}
      </div>
    </div>
  </div>
)
