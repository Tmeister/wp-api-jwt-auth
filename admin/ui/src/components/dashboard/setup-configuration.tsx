import { useState } from 'react'
import { Copy, RefreshCw, Key, AlertTriangle, CheckCircle } from 'lucide-react'
import { InfoCard } from '@/components/ui/info-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Generate a secure random key similar to WordPress salt generator
const generateSecureKey = (): string => {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?'
  let result = ''
  const array = new Uint8Array(64) // 64 character key
  window.crypto.getRandomValues(array)

  for (let i = 0; i < 64; i++) {
    result += chars[array[i] % chars.length]
  }

  return result
}

export const SetupConfiguration = () => {
  const [generatedKey, setGeneratedKey] = useState<string>(() => generateSecureKey())
  const [isGenerating, setIsGenerating] = useState(false)
  const [corsEnabled, setCorsEnabled] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleGenerateKey = async () => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 800)) // Simulate generation time
    const newKey = generateSecureKey()
    setGeneratedKey(newKey)
    setIsGenerating(false)
  }

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      console.log(`${type} copied to clipboard`)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const secretKeyConfig = `\ndefine('JWT_AUTH_SECRET_KEY', '${generatedKey}');`
  const corsConfig = corsEnabled ? `define('JWT_AUTH_CORS_ENABLE', true);` : ''
  const fullConfig = corsEnabled ? `${secretKeyConfig}\n${corsConfig}` : secretKeyConfig
  const phpConfig = fullConfig

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
              {phpConfig}
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
              {isGenerating ? (
                <>
                  <RefreshCw className="jwt-h-3 jwt-w-3 jwt-mr-2 jwt-animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="jwt-h-3 jwt-w-3 jwt-mr-2" />
                  Generate New Key
                </>
              )}
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
