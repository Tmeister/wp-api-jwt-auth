import {
  Shield,
  Eye,
  RotateCcw,
  Zap,
  Globe,
  TrendingUp,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { buildProUrl } from '@/lib/utils'

interface TokenDashboardProps {
  onBackToDashboard: () => void
}

export const TokenDashboard = ({ onBackToDashboard: _onBackToDashboard }: TokenDashboardProps) => {
  const proUrl = buildProUrl({
    source: 'token-dashboard',
    medium: 'placeholder',
    campaign: 'pro-upgrade',
    content: 'unlock-features',
  })

  const features = [
    {
      icon: Eye,
      title: 'Real-time Token Visibility',
      description:
        'Monitor all active JWT tokens with detailed dashboard insights and live status updates',
      color: 'jwt-text-blue-600',
      bgColor: 'jwt-bg-blue-50',
    },
    {
      icon: RotateCcw,
      title: 'Refresh Token Mechanism',
      description:
        'Automatic token rotation with secure refresh capabilities and seamless user experience',
      color: 'jwt-text-emerald-600',
      bgColor: 'jwt-bg-emerald-50',
    },
    {
      icon: Shield,
      title: 'Instant Token Revocation',
      description:
        'Auto-revoke on password/email/role changes for maximum security and threat prevention',
      color: 'jwt-text-purple-600',
      bgColor: 'jwt-bg-purple-50',
    },
    {
      icon: Zap,
      title: 'Rate Limiting',
      description:
        'Advanced rate limiting per IP address to prevent abuse and ensure system stability',
      color: 'jwt-text-red-600',
      bgColor: 'jwt-bg-red-50',
    },
    {
      icon: Globe,
      title: 'Geo-IP Login Tracking',
      description:
        'Identify and track login locations for enhanced security and suspicious activity detection',
      color: 'jwt-text-orange-600',
      bgColor: 'jwt-bg-orange-50',
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description:
        'Detailed usage tracking with 50+ WordPress hooks and comprehensive reporting dashboard',
      color: 'jwt-text-indigo-600',
      bgColor: 'jwt-bg-indigo-50',
    },
  ]

  const benefits = [
    'Refresh tokens with automatic rotation',
    'Instant revocation on security events',
    'Advanced rate limiting protection',
    'Geo-IP tracking and analytics',
    '50+ WordPress integration hooks',
    'Premium support and documentation',
  ]

  return (
    <div className="jwt-min-h-screen jwt-bg-gray-50">
      {/* Header Section */}
      <div className="jwt-relative jwt-overflow-hidden jwt-bg-gray-50">
        <div className="jwt-relative jwt-max-w-7xl jwt-mx-auto jwt-px-6 jwt-py-16 jwt-text-center">
          <div className="jwt-inline-flex jwt-items-center jwt-justify-center jwt-w-20 jwt-h-20 jwt-bg-blue-500/10 jwt-rounded-2xl jwt-mb-8">
            <Shield className="jwt-w-10 jwt-h-10 jwt-text-blue-600" />
          </div>
          <h1 className="jwt-text-5xl jwt-font-bold jwt-text-slate-800 jwt-mb-6">
            Token Dashboard
          </h1>
          <p className="jwt-text-xl jwt-text-slate-600 jwt-max-w-3xl jwt-mx-auto jwt-leading-relaxed">
            Real-time token management, refresh mechanisms, and advanced security features for
            modern applications
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="jwt-max-w-7xl jwt-mx-auto jwt-px-6 jwt-py-16">
        <div className="jwt-grid jwt-grid-cols-1 md:jwt-grid-cols-2 lg:jwt-grid-cols-3 jwt-gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const featureUrl = buildProUrl({
              source: 'token-dashboard',
              medium: 'feature-card',
              campaign: 'pro-upgrade',
              content: feature.title.toLowerCase().replace(/\s+/g, '-'),
            })

            return (
              <a
                key={index}
                href={featureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="jwt-block"
              >
                <Card className="jwt-group jwt-relative jwt-overflow-hidden jwt-bg-white jwt-rounded-xl jwt-shadow-sm hover:jwt-shadow-md jwt-transition-all jwt-duration-300 hover:jwt--translate-y-1 jwt-cursor-pointer">
                  <div className="jwt-p-8">
                    <div
                      className={`jwt-inline-flex jwt-items-center jwt-justify-center jwt-w-14 jwt-h-14 ${feature.bgColor} jwt-rounded-xl jwt-mb-6 group-hover:jwt-scale-110 jwt-transition-transform jwt-duration-300`}
                    >
                      <Icon className={`jwt-w-7 jwt-h-7 ${feature.color}`} />
                    </div>
                    <h3 className="jwt-text-xl jwt-font-semibold jwt-text-slate-800 jwt-mb-4">
                      {feature.title}
                    </h3>
                    <p className="jwt-text-slate-600 jwt-leading-relaxed">{feature.description}</p>
                  </div>
                  <div className="jwt-absolute jwt-inset-x-0 jwt-bottom-0 jwt-h-1 jwt-bg-gradient-to-r jwt-from-transparent jwt-via-blue-500/20 jwt-to-transparent jwt-opacity-0 group-hover:jwt-opacity-100 jwt-transition-opacity jwt-duration-300" />
                </Card>
              </a>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="jwt-max-w-7xl jwt-mx-auto jwt-px-6 jwt-py-16">
        <Card className="jwt-relative jwt-overflow-hidden jwt-border-0 jwt-bg-gradient-to-br jwt-from-blue-500/5 jwt-via-white jwt-to-blue-500/5 jwt-backdrop-blur-sm">
          <div className="jwt-absolute jwt-inset-0 jwt-bg-gradient-to-r jwt-from-blue-500/10 jwt-via-transparent jwt-to-blue-500/10" />
          <div className="jwt-relative jwt-p-12 jwt-text-center">
            <div className="jwt-inline-flex jwt-items-center jwt-justify-center jwt-w-16 jwt-h-16 jwt-bg-blue-500/10 jwt-rounded-2xl jwt-mb-8">
              <Shield className="jwt-w-8 jwt-h-8 jwt-text-blue-600" />
            </div>
            <h2 className="jwt-text-3xl jwt-font-bold jwt-text-slate-800 jwt-mb-6">
              Unlock Professional Token Management
            </h2>
            <p className="jwt-text-lg jwt-text-slate-600 jwt-max-w-3xl jwt-mx-auto jwt-mb-8 jwt-leading-relaxed">
              Upgrade to JWT Authentication Pro for refresh tokens, instant revocation, rate
              limiting, geo-IP tracking, and advanced analytics. Perfect for headless WordPress,
              mobile apps, and SPAs.
            </p>

            {/* Benefits List */}
            <div className="jwt-grid jwt-grid-cols-1 md:jwt-grid-cols-2 jwt-gap-4 jwt-max-w-2xl jwt-mx-auto jwt-mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="jwt-flex jwt-items-center jwt-gap-3 jwt-text-left">
                  <CheckCircle className="jwt-w-5 jwt-h-5 jwt-text-blue-600 jwt-flex-shrink-0" />
                  <span className="jwt-text-slate-600">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="jwt-flex jwt-flex-col sm:jwt-flex-row jwt-items-center jwt-justify-center jwt-gap-4 jwt-mb-8">
              <Button
                size="lg"
                className="jwt-bg-blue-600 hover:jwt-bg-blue-700 jwt-text-white hover:jwt-text-white jwt-px-8 jwt-py-3 jwt-text-lg jwt-font-semibold jwt-group"
                asChild
              >
                <a href={proUrl} target="_blank" rel="noopener noreferrer">
                  Get JWT Authentication Pro
                  <ArrowRight className="jwt-w-5 jwt-h-5 jwt-ml-2 group-hover:jwt-translate-x-1 jwt-transition-transform" />
                </a>
              </Button>
            </div>

            <p className="jwt-text-sm jwt-text-slate-500">
              Starting at <span className="jwt-font-semibold jwt-text-slate-800">$59.99/year</span>{' '}
              • 50+ WordPress hooks • Premium support
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
