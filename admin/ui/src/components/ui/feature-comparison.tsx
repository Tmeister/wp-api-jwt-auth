import { CheckCircle, XCircle } from 'lucide-react'

interface FeatureComparisonProps {
  feature: string
  isPro: boolean
}

export const FeatureComparison = ({ feature, isPro }: FeatureComparisonProps) => (
  <li className="jwt-flex jwt-items-start jwt-space-x-3 jwt-py-2">
    <div className="jwt-flex-shrink-0 jwt-mt-1">
      {isPro ? (
        <CheckCircle className="jwt-h-4 jwt-w-4 jwt-text-emerald-500" />
      ) : (
        <XCircle className="jwt-h-4 jwt-w-4 jwt-text-slate-400" />
      )}
    </div>
    <span className={`jwt-text-sm ${isPro ? 'jwt-text-slate-800' : 'jwt-text-slate-500'}`}>
      {feature}
    </span>
  </li>
)
