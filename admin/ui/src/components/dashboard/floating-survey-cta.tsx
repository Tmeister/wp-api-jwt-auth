import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface FloatingSurveyCTAProps {
  isVisible: boolean
  onClose: () => void
  onTakeSurvey: () => void
}

export const FloatingSurveyCTA = ({ isVisible, onClose, onTakeSurvey }: FloatingSurveyCTAProps) => {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
    } else {
      // Delay unmounting to allow exit animation
      const timer = setTimeout(() => setShouldRender(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!shouldRender) return null

  return (
    <div
      className={`jwt-fixed jwt-bottom-6 jwt-right-6 jwt-z-50 jwt-transition-all jwt-duration-500 jwt-ease-out jwt-m-4 sm:jwt-m-0 ${
        isVisible
          ? 'jwt-opacity-100 jwt-translate-y-0 jwt-scale-100'
          : 'jwt-opacity-0 jwt-translate-y-8 jwt-scale-90'
      }`}
    >
      <Card className="jwt-w-full jwt-max-w-xs jwt-shadow-xl jwt-bg-white">
        <Button
          variant="ghost"
          size="icon"
          className="jwt-absolute jwt-top-3 jwt-right-3 jwt-h-6 jwt-w-6 jwt-text-slate-500 hover:jwt-text-slate-800 jwt-z-10"
          onClick={onClose}
        >
          <X className="jwt-h-4 jwt-w-4" />
          <span className="jwt-sr-only">Close</span>
        </Button>
        <CardContent className="jwt-p-6">
          <span className="jwt-font-semibold jwt-text-slate-800 jwt-text-base jwt-mb-2 jwt-mt-4 jwt-block">
            Get 15% Off Pro!
          </span>
          <p className="jwt-text-sm jwt-text-slate-600 jwt-mb-4">
            Take our 2-min survey to help us improve and claim your discount.
          </p>
          <Button
            size="sm"
            className="jwt-w-full jwt-bg-emerald-600 hover:jwt-bg-emerald-700"
            onClick={onTakeSurvey}
          >
            Take Survey
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
