import type React from 'react'

interface StatusRowProps {
  label: string
  children: React.ReactNode
}

export const StatusRow = ({ label, children }: StatusRowProps) => (
  <div className="jwt-flex jwt-items-center jwt-justify-between jwt-py-4 jwt-border-b jwt-border-slate-100 last:jwt-border-b-0">
    <span className="jwt-text-sm jwt-text-slate-600">{label}</span>
    <div className="jwt-flex jwt-items-center jwt-space-x-3 jwt-text-sm jwt-font-medium jwt-text-slate-800">
      {children}
    </div>
  </div>
)
