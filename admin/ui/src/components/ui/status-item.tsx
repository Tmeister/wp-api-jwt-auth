import type React from 'react'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

interface StatusItemProps {
  label: string
  value: React.ReactNode
  proFeature?: boolean
  good?: boolean
  warning?: boolean
}

export const StatusItem = ({
  label,
  value,
  proFeature = false,
  good = false,
  warning = false,
}: StatusItemProps) => (
  <div className="jwt-flex jwt-items-center jwt-justify-between jwt-py-3 jwt-border-b jwt-border-slate-100 last:jwt-border-b-0">
    <span className="jwt-text-sm jwt-text-slate-700">{label}</span>
    <div className="jwt-flex jwt-items-center jwt-space-x-2">
      {good && <CheckCircle className="jwt-h-5 jwt-w-5 jwt-text-emerald-500" />}
      {warning && <AlertTriangle className="jwt-h-5 jwt-w-5 jwt-text-amber-500" />}
      {proFeature && <XCircle className="jwt-h-5 jwt-w-5 jwt-text-red-500" />}
      <span className="jwt-text-sm jwt-font-medium jwt-text-slate-800 jwt-text-right">{value}</span>
    </div>
  </div>
)
