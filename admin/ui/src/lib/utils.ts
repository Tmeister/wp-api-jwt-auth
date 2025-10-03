import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Build a Pro URL with consistent UTM parameters
 */
export function buildProUrl(params: {
  source: 'dashboard' | 'plugin-list' | 'wp-menu' | 'survey'
  medium: string
  campaign: string
  content: string
  path?: string
}): string {
  const baseUrl = 'https://jwtauth.pro'
  const fullPath = params.path || '/upgrade'

  const queryParams = new URLSearchParams({
    utm_source: params.source,
    utm_medium: params.medium,
    utm_campaign: params.campaign,
    utm_content: params.content,
  })

  return `${baseUrl}${fullPath}?${queryParams.toString()}`
}

/**
 * Get the current week number for CTA rotation
 */
export function getWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.floor(diff / oneWeek)
}

/**
 * Get dynamic CTA text based on weekly rotation
 */
export function getDynamicCTAText(location: 'header' | 'plugin-list'): string {
  const weekNumber = getWeekNumber()
  const weekIndex = weekNumber % 4

  const headerCTAs = [
    'Add Token Dashboard →',
    'Enable Token Refresh →',
    'View API Analytics →',
    'Enable Revocation →',
  ]

  const pluginListCTAs = [
    '🔐 Add Token Dashboard',
    '🔄 Enable Auto-Refresh',
    '📊 View API Analytics',
    '🎯 Manage All Tokens',
  ]

  return location === 'header' ? headerCTAs[weekIndex] : pluginListCTAs[weekIndex]
}
