import { useState, useMemo, useCallback } from 'react'
import { Copy, RefreshCw, Key, AlertTriangle, CheckCircle } from 'lucide-react'
import { InfoCard } from '@/components/ui/info-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const CONFIG = {
  KEY_LENGTH: 64,
  COPY_FEEDBACK_DURATION: 2000,
  GENERATION_DELAY: 800,
  CHAR_SET:
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?',
} as const

// Generate a secure random key similar to WordPress salt generator
const generateSecureKey = (): string => {
  let result = ''
  const array = new Uint8Array(CONFIG.KEY_LENGTH)
  window.crypto.getRandomValues(array)

  for (let i = 0; i < CONFIG.KEY_LENGTH; i++) {
    result += CONFIG.CHAR_SET[array[i] % CONFIG.CHAR_SET.length]
  }

  return result
}

export const SetupConfiguration = () => {
  const [generatedKey, setGeneratedKey] = useState<string>(() => generateSecureKey())
  const [isGenerating, setIsGenerating] = useState(false)
  const [corsEnabled, setCorsEnabled] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleGenerateKey = useCallback(async () => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, CONFIG.GENERATION_DELAY))
    const newKey = generateSecureKey()
    setGeneratedKey(newKey)
    setIsGenerating(false)
  }, [])

  const handleCopy = useCallback(async (text: string, _type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), CONFIG.COPY_FEEDBACK_DURATION)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  const fullConfig = useMemo(() => {
    return corsEnabled
      ? `\ndefine('JWT_AUTH_SECRET_KEY', '${generatedKey}');\ndefine('JWT_AUTH_CORS_ENABLE', true);`
      : `\ndefine('JWT_AUTH_SECRET_KEY', '${generatedKey}');`
  }, [generatedKey, corsEnabled])

  return (
    <InfoCard
      title="Configuration"
      description="Complete the setup to enable JWT Authentication"
      headerAccessory={
        <Badge className="jwt-bg-amber-100 jwt-text-amber-800 jwt-border-amber-200">
          <Key className="jwt-h-3 jwt-w-3 jwt-mr-1" />
          Setup Required
        </Badge>
      }
    >
      <div className="jwt-space-y-6">
        {/* Configuration Section */}
        <div className="jwt-space-y-4">
          <div className="jwt-relative jwt-overflow-hidden jwt-rounded-lg jwt-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(fullConfig, 'Configuration')}
              className="jwt-h-6 jwt-w-6 jwt-p-0 jwt-text-slate-400 hover:jwt-text-white jwt-bg-slate-800 hover:jwt-bg-slate-700 jwt-absolute jwt-top-2 jwt-right-2 jwt-z-10 jwt-rounded"
            >
              {copySuccess ? (
                <CheckCircle className="jwt-h-3 jwt-w-3 jwt-text-green-400" />
              ) : (
                <Copy className="jwt-h-3 jwt-w-3" />
              )}
            </Button>
            <SyntaxHighlighter
              language="php"
              style={oneDark}
              customStyle={{
                margin: 0,
                fontSize: '0.875rem',
                padding: '1rem',
                paddingRight: '3rem',
              }}
              codeTagProps={{
                style: {
                  whiteSpace: 'pre',
                  wordBreak: 'break-all',
                },
              }}
            >
              {fullConfig}
            </SyntaxHighlighter>
          </div>

          <div className="jwt-flex jwt-items-center jwt-justify-between">
            <div className="jwt-flex jwt-items-center jwt-space-x-2">
              <Switch id="cors-toggle" checked={corsEnabled} onCheckedChange={setCorsEnabled} />
              <Label htmlFor="cors-toggle" className="jwt-text-sm jwt-font-medium">
                Enable CORS Support
              </Label>
            </div>
            <Button
              onClick={handleGenerateKey}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="jwt-h-8"
            >
              <RefreshCw
                className={`jwt-h-3 jwt-w-3 jwt-mr-2 ${isGenerating ? 'jwt-animate-spin' : ''}`}
              />
              {isGenerating ? 'Generating...' : 'Generate New Key'}
            </Button>
          </div>

          <div className="jwt-border jwt-border-amber-200 jwt-bg-amber-50 jwt-p-3 jwt-rounded-lg">
            <div className="jwt-flex jwt-items-start jwt-gap-2">
              <AlertTriangle className="jwt-h-4 jwt-w-4 jwt-text-amber-600 jwt-mt-0.5 jwt-flex-shrink-0" />
              <div className="jwt-text-amber-800 jwt-text-sm">
                <strong>Important:</strong> Copy this configuration and add it to your wp-config.php
                file. Keep it secure and never share it publicly.
              </div>
            </div>
          </div>
        </div>

        <div className="jwt-border-t jwt-border-gray-200"></div>
      </div>
    </InfoCard>
  )
}
