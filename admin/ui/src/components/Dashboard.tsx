import { useState, useMemo, useEffect } from 'react'
import type React from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle, Loader2, Copy, Send, X, AlertTriangle } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Topbar } from './dashboard/topbar'
import { SurveyPage } from './survey/SurveyPage'
import { wordpressAPI, type ConfigurationStatus } from '@/lib/wordpress-api'

// --- REUSABLE UI COMPONENTS ---

const InfoCard = ({
  title,
  description,
  children,
  headerAccessory,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  headerAccessory?: React.ReactNode
  footer?: React.ReactNode
}) => (
  <Card className="jwt-bg-white jwt-rounded-xl jwt-shadow-sm jwt-flex jwt-flex-col">
    <CardHeader className="jwt-p-6">
      <div className="jwt-flex jwt-justify-between jwt-items-start jwt-gap-4">
        <div>
          <CardTitle className="jwt-text-lg jwt-font-semibold jwt-text-slate-800 jwt-mb-2">
            {title}
          </CardTitle>
          <CardDescription className="jwt-text-sm jwt-text-slate-600">
            {description}
          </CardDescription>
        </div>
        {headerAccessory && <div className="jwt-flex-shrink-0">{headerAccessory}</div>}
      </div>
    </CardHeader>
    <CardContent className="jwt-flex-grow jwt-p-6 jwt-pt-0">{children}</CardContent>
    {footer && (
      <CardFooter className="jwt-bg-slate-50 jwt-p-6 jwt-rounded-b-xl jwt-border-t">
        {footer}
      </CardFooter>
    )}
  </Card>
)

const StatusRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="jwt-flex jwt-items-center jwt-justify-between jwt-py-4 jwt-border-b jwt-border-slate-100 last:jwt-border-b-0">
    <span className="jwt-text-sm jwt-text-slate-600">{label}</span>
    <div className="jwt-flex jwt-items-center jwt-space-x-3 jwt-text-sm jwt-font-medium jwt-text-slate-800">
      {children}
    </div>
  </div>
)

const Check = () => <CheckCircle className="jwt-h-5 jwt-w-5 jwt-text-emerald-500" />

// --- PAGE SECTIONS / CARDS ---

const AuthenticationStatusOverview = () => (
  <div className="jwt-bg-slate-800 jwt-text-white jwt-rounded-t-xl jwt-p-8 jwt-text-center">
    <h1 className="jwt-text-2xl jwt-font-bold jwt-text-white">JWT Authentication for WP-API</h1>
    <p className="jwt-text-slate-300 jwt-mt-4 jwt-max-w-lg jwt-mx-auto jwt-text-base">
      Enabling stateless authentication for your WordPress REST API with industry-standard JWT
      tokens.
    </p>
  </div>
)

const ConfigurationHealthCheck = ({
  configStatus,
}: {
  configStatus: ConfigurationStatus | null
}) => {
  if (!configStatus) {
    return (
      <InfoCard title="Configuration Health Check" description="Loading configuration status...">
        <div className="jwt-flex jwt-items-center jwt-justify-center jwt-py-8">
          <Loader2 className="jwt-h-6 jwt-w-6 jwt-animate-spin jwt-text-slate-400" />
        </div>
      </InfoCard>
    )
  }

  const { configuration } = configStatus
  const allConfigured = configuration.secret_key_configured

  return (
    <InfoCard
      title="Configuration Health Check"
      description="JWT Configuration Status"
      headerAccessory={
        <div
          className={`jwt-inline-flex jwt-items-center jwt-gap-x-1.5 jwt-rounded-full jwt-px-2.5 jwt-py-1 jwt-text-xs jwt-font-medium ${
            allConfigured
              ? 'jwt-bg-emerald-100 jwt-text-emerald-800'
              : 'jwt-bg-yellow-100 jwt-text-yellow-800'
          }`}
        >
          <span className="jwt-mr-2">{allConfigured ? 'Ready' : 'Needs Attention'}</span>
          {allConfigured ? (
            <CheckCircle className="jwt-h-3.5 jwt-w-3.5 jwt--ml-0.5" />
          ) : (
            <X className="jwt-h-3.5 jwt-w-3.5 jwt--ml-0.5" />
          )}
        </div>
      }
    >
      <StatusRow label="Secret Key">
        <span className="jwt-mr-2">
          {configuration.secret_key_configured ? 'Configured & Valid' : 'Not Configured'}
        </span>
        {configuration.secret_key_configured ? (
          <Check />
        ) : (
          <X className="jwt-h-5 jwt-w-5 jwt-text-red-500" />
        )}
      </StatusRow>
      <StatusRow label="CORS Support">
        <span className="jwt-mr-2">{configuration.cors_enabled ? 'Enabled' : 'Disabled'}</span>
        {configuration.cors_enabled ? (
          <Check />
        ) : (
          <AlertTriangle className="jwt-h-5 jwt-w-5 jwt-text-yellow-500" />
        )}
      </StatusRow>
      <StatusRow label="Authentication Endpoints">
        <span className="jwt-mr-2">
          {configuration.secret_key_configured ? 'Active' : 'Inactive'}
        </span>
        {configuration.secret_key_configured ? (
          <Check />
        ) : (
          <X className="jwt-h-5 jwt-w-5 jwt-text-red-500" />
        )}
      </StatusRow>
      <StatusRow label="Token Standard">
        <span className="jwt-mr-2">RFC 7519 Compliant</span>
        {configuration.secret_key_configured ? (
          <Check />
        ) : (
          <X className="jwt-h-5 jwt-w-5 jwt-text-red-500" />
        )}
      </StatusRow>
      {configuration.secret_key_configured && (
        <StatusRow label="Ready for Integrations">
          <Check />
        </StatusRow>
      )}
    </InfoCard>
  )
}

const SystemEnvironment = ({ configStatus }: { configStatus: ConfigurationStatus | null }) => {
  if (!configStatus) {
    return (
      <InfoCard title="System Environment Check" description="Loading system information...">
        <div className="jwt-flex jwt-items-center jwt-justify-center jwt-py-8">
          <Loader2 className="jwt-h-6 jwt-w-6 jwt-animate-spin jwt-text-slate-400" />
        </div>
      </InfoCard>
    )
  }

  const { system } = configStatus
  const allCompatible = system.php_compatible

  return (
    <InfoCard
      title="System Environment Check"
      description={
        allCompatible
          ? 'Your server meets all requirements for JWT authentication'
          : 'Some system requirements need attention'
      }
    >
      <StatusRow label="PHP Version">
        <span className="jwt-mr-2">
          {system.php_version} {system.pro_compatible ? '(Pro Compatible)' : '(Update Recommended)'}
        </span>
        {system.php_compatible ? <Check /> : <X className="jwt-h-5 jwt-w-5 jwt-text-red-500" />}
      </StatusRow>
      <StatusRow label="WordPress Version">
        <span className="jwt-mr-2">{system.wordpress_version} (Supported)</span>
        <Check />
      </StatusRow>
      <StatusRow label="Memory Limit">
        <span className="jwt-mr-2">{system.php_memory_limit} (Sufficient)</span>
        <Check />
      </StatusRow>
      <StatusRow label="MySQL Version">
        <span className="jwt-mr-2">{system.mysql_version}</span>
        <Check />
      </StatusRow>
      <StatusRow label="Post Max Size">
        <span className="jwt-mr-2">{system.post_max_size}</span>
        <Check />
      </StatusRow>
    </InfoCard>
  )
}

const HelpImprove = () => {
  const [isSharing, setIsSharing] = useState(false)
  return (
    <InfoCard
      title="Help Improve JWT Authentication (Optional)"
      description="Anonymous Usage Sharing"
    >
      <div className="jwt-flex jwt-items-start jwt-justify-between jwt-gap-4">
        <div className="jwt-flex-1">
          <p className="jwt-text-sm jwt-font-medium jwt-text-slate-700 jwt-mb-2">
            Enable Anonymous Sharing
          </p>
          <p className="jwt-text-sm jwt-text-slate-500">
            Help us build features you actually need by sharing non-sensitive data like PHP/WP
            versions and plugin status.
          </p>
        </div>
        <Switch checked={isSharing} onCheckedChange={setIsSharing} />
      </div>
    </InfoCard>
  )
}

const CodeSnippetDisplay = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Map language names to syntax highlighter language codes
  const getLanguageCode = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'curl':
        return 'bash'
      case 'javascript':
        return 'javascript'
      case 'python':
        return 'python'
      case 'php':
        return 'php'
      default:
        return 'text'
    }
  }

  return (
    <div className="jwt-relative">
      <SyntaxHighlighter
        language={getLanguageCode(language)}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          padding: '1rem',
        }}
        className="jwt-text-sm"
      >
        {code}
      </SyntaxHighlighter>
      <Button
        size="icon"
        variant="ghost"
        className="jwt-absolute jwt-top-3 jwt-right-3 jwt-h-8 jwt-w-8"
        onClick={handleCopy}
      >
        {copied ? (
          <CheckCircle className="jwt-h-4 jwt-w-4 jwt-text-emerald-400" />
        ) : (
          <Copy className="jwt-h-4 jwt-w-4 jwt-text-slate-400" />
        )}
      </Button>
    </div>
  )
}

const EndpointTester = () => {
  const [endpoint, setEndpoint] = useState('/jwt-auth/v1/token')
  const [username, setUsername] = useState('testuser')
  const [password, setPassword] = useState('password')
  const [token, setToken] = useState('your-jwt-token')
  const [isLoading, setIsLoading] = useState(false)
  const [responseCopied, setResponseCopied] = useState(false)
  const [tokenAutoFilled, setTokenAutoFilled] = useState(false)
  const [response, setResponse] = useState<{
    error?: string
    details?: Record<string, unknown>
    [key: string]: unknown
  } | null>(null)

  // Get WordPress site URL from config
  const siteUrl = window.jwtAuthConfig?.siteUrl || 'https://yoursite.com'

  const getCodeSnippets = (endpointPath: string) => {
    const fullUrl = `${siteUrl}/wp-json${endpointPath}`

    if (endpointPath === '/jwt-auth/v1/token') {
      const body = `{ "username": "${username}", "password": "${password}" }`

      return {
        cURL: `curl -X POST ${fullUrl} \\
-H 'Content-Type: application/json' \\
-d '${body}'`,
        JavaScript: `const options = {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify(${body})\n};\n\nfetch('${fullUrl}', options)\n  .then(response => response.json())\n  .then(response => console.log(response))\n  .catch(err => console.error(err));`,
        Python: `import requests\nimport json\n\nurl = "${fullUrl}"\npayload = json.dumps(${body.replace(/"/g, `"`).replace(/: "/g, `: "`).replace(/", "/g, `", "`)})\nheaders = {\n  'Content-Type': 'application/json'\n}\n\nresponse = requests.request("POST", url, headers=headers, data=payload)\n\nprint(response.text)`,
        PHP: `<?php\n\n$url = '${fullUrl}';\n$data = ${body};\n\n$options = array(\n    'http' => array(\n        'header' => "Content-type: application/json\\r\\n",\n        'method' => 'POST',\n        'content' => $data\n    )\n);\n\n$context = stream_context_create($options);\n$result = file_get_contents($url, false, $context);\n\nif ($result === FALSE) {\n    die('Error occurred');\n}\n\necho $result;`,
      }
    } else {
      // For validation endpoint, use Authorization header
      return {
        cURL: `curl -X POST ${fullUrl} \\
-H 'Content-Type: application/json' \\
-H 'Authorization: Bearer ${token}' \\
-d '{}'`,
        JavaScript: `const options = {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n    'Authorization': 'Bearer ${token}'\n  },\n  body: JSON.stringify({})\n};\n\nfetch('${fullUrl}', options)\n  .then(response => response.json())\n  .then(response => console.log(response))\n  .catch(err => console.error(err));`,
        Python: `import requests\nimport json\n\nurl = "${fullUrl}"\nheaders = {\n  'Content-Type': 'application/json',\n  'Authorization': 'Bearer ${token}'\n}\n\nresponse = requests.request("POST", url, headers=headers, data=json.dumps({}))\n\nprint(response.text)`,
        PHP: `<?php\n\n$url = '${fullUrl}';\n\n$options = array(\n    'http' => array(\n        'header' => "Content-type: application/json\\r\\n" .\n                   "Authorization: Bearer ${token}\\r\\n",\n        'method' => 'POST',\n        'content' => '{}'\n    )\n);\n\n$context = stream_context_create($options);\n$result = file_get_contents($url, false, $context);\n\nif ($result === FALSE) {\n    die('Error occurred');\n}\n\necho $result;`,
      }
    }
  }

  const handleSend = async () => {
    setIsLoading(true)
    setResponse(null)

    try {
      const fullUrl = `${siteUrl}/wp-json${endpoint}`

      // Prepare request headers and body based on endpoint
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      let requestBody: object = {}

      if (endpoint === '/jwt-auth/v1/token') {
        if (!username.trim() || !password.trim()) {
          setResponse({
            error: 'Username and password are required for token generation',
          })
          setIsLoading(false)
          return
        }
        requestBody = {
          username: username.trim(),
          password: password.trim(),
        }
      } else if (endpoint === '/jwt-auth/v1/token/validate') {
        if (!token.trim()) {
          setResponse({
            error: 'Token is required for validation',
          })
          setIsLoading(false)
          return
        }
        // For validation endpoint, send token in Authorization header
        headers['Authorization'] = `Bearer ${token.trim()}`
        requestBody = {}
      }

      // Make the actual API request
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      })

      // Handle response
      if (response.ok) {
        const data = await response.json()
        setResponse(data)

        // Auto-fill token for validation if this was a successful token request
        if (endpoint === '/jwt-auth/v1/token' && data.token) {
          setToken(data.token)
          setTokenAutoFilled(true)
          // Hide the notice after 5 seconds
          setTimeout(() => setTokenAutoFilled(false), 5000)
        }
      } else {
        // Try to get error message from response
        try {
          const errorData = await response.json()
          setResponse({
            error: `HTTP ${response.status}: ${errorData.message || response.statusText}`,
            details: errorData,
          })
        } catch {
          setResponse({
            error: `HTTP ${response.status}: ${response.statusText}`,
          })
        }
      }
    } catch (error) {
      setResponse({
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const snippets = getCodeSnippets(endpoint)

  return (
    <Card className="jwt-bg-white jwt-rounded-xl jwt-shadow-sm jwt-overflow-hidden">
      <CardHeader className="jwt-p-6">
        <CardTitle className="jwt-text-lg jwt-font-semibold jwt-text-slate-800 jwt-mb-2">
          Live API Explorer
        </CardTitle>
        <CardDescription className="jwt-text-sm jwt-text-slate-600">
          Test your JWT endpoints in real-time and get instant code snippets.
        </CardDescription>
      </CardHeader>
      <CardContent className="jwt-p-6 jwt-pt-0">
        <div className="jwt-flex jwt-items-center jwt-gap-3 jwt-border jwt-rounded-lg jwt-p-3 jwt-bg-slate-50">
          <div className="jwt-flex jwt-items-center jwt-gap-2">
            <Select defaultValue="/jwt-auth/v1/token" onValueChange={setEndpoint}>
              <SelectTrigger className="jwt-w-[180px] jwt-bg-white">
                <SelectValue placeholder="Select endpoint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="/jwt-auth/v1/token">POST /token</SelectItem>
                <SelectItem value="/jwt-auth/v1/token/validate">POST /token/validate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="jwt-flex-1 jwt-text-sm jwt-text-slate-600 jwt-font-mono jwt-bg-white jwt-px-3 jwt-py-2 jwt-rounded jwt-border jwt-overflow-hidden">
            {endpoint}
          </div>
          <Button onClick={handleSend} disabled={isLoading} className="jwt-shrink-0">
            {isLoading ? (
              <Loader2 className="jwt-mr-2 jwt-h-4 jwt-w-4 jwt-animate-spin" />
            ) : (
              <Send className="jwt-mr-2 jwt-h-4 jwt-w-4" />
            )}
            Send
          </Button>
        </div>

        <div className="jwt-grid jwt-grid-cols-1 lg:jwt-grid-cols-2 jwt-gap-8 jwt-mt-8">
          <div className="jwt-space-y-6">
            <div className="jwt-border jwt-border-slate-200 jwt-px-5 jwt-py-3 jwt-rounded-lg jwt-pb-5">
              <h3 className="jwt-text-sm jwt-font-semibold jwt-text-slate-700 jwt-mb-4 jwt-border-b jwt-border-slate-200 jwt-py-2">
                Server
              </h3>
              <div className="jwt-mt-5">
                <Label
                  htmlFor="domain"
                  className="jwt-text-sm jwt-font-medium jwt-text-slate-600 jwt-mb-2 jwt-block"
                >
                  WordPress URL
                </Label>
                <Input
                  id="domain"
                  value={siteUrl}
                  disabled
                  className="jwt-bg-slate-50 jwt-text-slate-500 disabled:jwt-text-slate-700 disabled:jwt-opacity-100"
                />
              </div>
            </div>

            <div className="jwt-border jwt-border-slate-200 jwt-px-5 jwt-py-3 jwt-rounded-lg jwt-pb-5">
              <h3 className="jwt-text-sm jwt-font-semibold jwt-text-slate-700 jwt-mb-4 jwt-border-b jwt-border-slate-200 jwt-py-2">
                Request Body
              </h3>
              <div className="jwt-space-y-4 jwt-mt-5">
                {endpoint === '/jwt-auth/v1/token' ? (
                  <>
                    <div>
                      <Label
                        htmlFor="username"
                        className="jwt-text-sm jwt-font-medium jwt-text-slate-600 jwt-flex jwt-items-center jwt-mb-2"
                      >
                        username{' '}
                        <span className="jwt-ml-2 jwt-text-red-500 jwt-bg-red-100 jwt-px-1.5 jwt-py-0.5 jwt-rounded-full jwt-text-xs">
                          required
                        </span>
                      </Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="password"
                        className="jwt-text-sm jwt-font-medium jwt-text-slate-600 jwt-flex jwt-items-center jwt-mb-2"
                      >
                        password{' '}
                        <span className="jwt-ml-2 jwt-text-red-500 jwt-bg-red-100 jwt-px-1.5 jwt-py-0.5 jwt-rounded-full jwt-text-xs">
                          required
                        </span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <Label
                      htmlFor="token"
                      className="jwt-text-sm jwt-font-medium jwt-text-slate-600 jwt-flex jwt-items-center jwt-mb-2"
                    >
                      token{' '}
                      <span className="jwt-ml-2 jwt-text-red-500 jwt-bg-red-100 jwt-px-1.5 jwt-py-0.5 jwt-rounded-full jwt-text-xs">
                        required
                      </span>
                    </Label>
                    {tokenAutoFilled && (
                      <div className="jwt-border-l-4 jwt-border-blue-400 jwt-bg-blue-50 jwt-p-3 jwt-mb-3">
                        <div className="jwt-flex">
                          <div className="jwt-shrink-0">
                            <CheckCircle className="jwt-h-4 jwt-w-4 jwt-text-blue-400" />
                          </div>
                          <div className="jwt-ml-2">
                            <p className="jwt-text-xs jwt-text-blue-700">
                              <span className="jwt-font-medium">Token Auto-filled:</span> The JWT
                              token from your successful request has been automatically added below.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <Input
                      id="token"
                      value={token}
                      onChange={e => {
                        setToken(e.target.value)
                        setTokenAutoFilled(false) // Hide notice when user manually edits
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="jwt-space-y-6">
            <Tabs defaultValue="cURL">
              <TabsList>
                <TabsTrigger value="cURL">cURL</TabsTrigger>
                <TabsTrigger value="PHP">PHP</TabsTrigger>
                <TabsTrigger value="JavaScript">JavaScript</TabsTrigger>
                <TabsTrigger value="Python">Python</TabsTrigger>
              </TabsList>
              <TabsContent value="cURL">
                <CodeSnippetDisplay code={snippets.cURL} language="curl" />
              </TabsContent>
              <TabsContent value="JavaScript">
                <CodeSnippetDisplay code={snippets.JavaScript} language="javascript" />
              </TabsContent>
              <TabsContent value="Python">
                <CodeSnippetDisplay code={snippets.Python} language="python" />
              </TabsContent>
              <TabsContent value="PHP">
                <CodeSnippetDisplay code={snippets.PHP} language="php" />
              </TabsContent>
            </Tabs>

            <div>
              <h3 className="jwt-text-sm jwt-font-semibold jwt-text-slate-700 jwt-mb-4">
                Response
              </h3>
              {/* Loading State */}
              {isLoading && (
                <div className="jwt-border-l-4 jwt-border-blue-400 jwt-bg-blue-50 jwt-p-4 jwt-mb-4">
                  <div className="jwt-flex">
                    <div className="jwt-shrink-0">
                      <Loader2 className="jwt-h-5 jwt-w-5 jwt-animate-spin jwt-text-blue-400" />
                    </div>
                    <div className="jwt-ml-3">
                      <p className="jwt-text-sm jwt-text-blue-700">Sending request...</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Success/Error Alert */}
              {response && (
                <div className="jwt-mb-4">
                  {response.error ? (
                    <div className="jwt-border-l-4 jwt-border-red-400 jwt-bg-red-50 jwt-p-4">
                      <div className="jwt-flex">
                        <div className="jwt-shrink-0">
                          <X className="jwt-h-5 jwt-w-5 jwt-text-red-400" />
                        </div>
                        <div className="jwt-ml-3">
                          <p className="jwt-text-sm jwt-text-red-700">
                            <span className="jwt-font-medium">Request Failed:</span>{' '}
                            {String(response.error)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="jwt-border-l-4 jwt-border-green-400 jwt-bg-green-50 jwt-p-4">
                      <div className="jwt-flex">
                        <div className="jwt-shrink-0">
                          <CheckCircle className="jwt-h-5 jwt-w-5 jwt-text-green-400" />
                        </div>
                        <div className="jwt-ml-3">
                          <p className="jwt-text-sm jwt-text-green-700">
                            <span className="jwt-font-medium">Request Successful:</span> The API
                            request completed successfully
                            {endpoint === '/jwt-auth/v1/token' &&
                              ' and the token is ready to be used on the validate endpoint'}
                            .
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Response Content Box */}
              {response && (
                <div>
                  <div className="jwt-mb-2">
                    <span className="jwt-text-xs jwt-font-medium jwt-text-slate-500 jwt-uppercase jwt-tracking-wider">
                      Response Body
                    </span>
                  </div>
                  <div className="jwt-relative">
                    <div className="jwt-overflow-hidden jwt-rounded-lg jwt-border">
                      <SyntaxHighlighter
                        language="json"
                        style={oneDark}
                        customStyle={{
                          margin: 0,
                          fontSize: '0.875rem',
                          padding: '1rem',
                        }}
                      >
                        {JSON.stringify(response, null, 2)}
                      </SyntaxHighlighter>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="jwt-absolute jwt-top-3 jwt-right-3 jwt-h-8 jwt-w-8"
                      onClick={() => {
                        const text = JSON.stringify(response, null, 2)
                        navigator.clipboard.writeText(text)
                        setResponseCopied(true)
                        setTimeout(() => setResponseCopied(false), 2000)
                      }}
                    >
                      {responseCopied ? (
                        <CheckCircle className="jwt-h-4 jwt-w-4 jwt-text-emerald-400" />
                      ) : (
                        <Copy className="jwt-h-4 jwt-w-4 jwt-text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
              {/* Empty State */}
              {!isLoading && !response && (
                <div className="jwt-border-2 jwt-border-dashed jwt-border-slate-200 jwt-rounded-lg jwt-p-8 jwt-text-center">
                  <div className="jwt-w-12 jwt-h-12 jwt-bg-slate-100 jwt-rounded-full jwt-flex jwt-items-center jwt-justify-center jwt-mx-auto jwt-mb-3">
                    <Send className="jwt-h-5 jwt-w-5 jwt-text-slate-400" />
                  </div>
                  <p className="jwt-text-slate-600 jwt-text-sm jwt-font-medium jwt-mb-1">
                    Ready to test your API
                  </p>
                  <p className="jwt-text-slate-500 jwt-text-xs">
                    Click the "Send" button above to make a request
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const FloatingSurveyCTA = ({
  isVisible,
  onClose,
  onTakeSurvey,
}: {
  isVisible: boolean
  onClose: () => void
  onTakeSurvey: () => void
}) => {
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
            Get 20% Off Pro!
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

// --- MAIN DASHBOARD COMPONENT ---

export default function Dashboard() {
  const [shareData, setShareData] = useState(false)
  const [configStatus, setConfigStatus] = useState<ConfigurationStatus | null>(null)
  const [isSurveyCtaVisible, setIsSurveyCtaVisible] = useState(false)
  const [isUserDismissed, setIsUserDismissed] = useState(false)

  // Initialize page based on URL hash or default to overview
  const getInitialPage = (): 'overview' | 'survey' => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(window.location.search)

    if (hash === 'survey' || params.get('page') === 'survey') {
      return 'survey'
    }
    return 'overview'
  }

  const [currentPage, setCurrentPage] = useState<'overview' | 'survey'>(getInitialPage)

  // Load settings from WordPress on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Load both settings and configuration status in parallel
        const [settings, status] = await Promise.all([
          wordpressAPI.getSettings(),
          wordpressAPI.getConfigurationStatus(),
        ])

        setShareData(settings.share_data)
        setConfigStatus(status)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }

    loadData()
  }, [])

  // Listen for hash changes to support back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1)
      if (hash === 'survey' && currentPage !== 'survey') {
        setCurrentPage('survey')
      } else if (hash === 'overview' && currentPage !== 'overview') {
        setCurrentPage('overview')
      } else if (!hash && currentPage !== 'overview') {
        setCurrentPage('overview')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [currentPage])

  // Handle scroll to show/hide survey CTA at 50% scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / documentHeight) * 100
      // Don't show if user manually dismissed it or if on survey page
      if (isUserDismissed || currentPage === 'survey') return

      // Show/hide survey CTA based on scroll position
      if (scrollPercent >= 50 && !isSurveyCtaVisible) {
        setIsSurveyCtaVisible(true)
      } else if (scrollPercent < 50 && isSurveyCtaVisible) {
        setIsSurveyCtaVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isSurveyCtaVisible, isUserDismissed, currentPage])

  const discount = useMemo(() => {
    let total = 0
    if (shareData) total += 15
    return total
  }, [shareData])

  // Handle page navigation with URL updates
  const handlePageChange = (page: 'overview' | 'survey') => {
    setCurrentPage(page)

    // Update URL hash for deep linking
    if (page === 'survey') {
      window.history.pushState(null, '', '#survey')
    } else {
      window.history.pushState(null, '', '#overview')
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'survey':
        return <SurveyPage onBackToDashboard={() => handlePageChange('overview')} />
      case 'overview':
      default:
        return (
          <div className="jwt-space-y-8">
            <AuthenticationStatusOverview />
            <div className="jwt-grid jwt-grid-cols-1 lg:jwt-grid-cols-2 jwt-gap-8">
              <ConfigurationHealthCheck configStatus={configStatus} />
              <SystemEnvironment configStatus={configStatus} />
            </div>
            <EndpointTester />
            <HelpImprove />
          </div>
        )
    }
  }

  return (
    <div className="jwt-flex jwt-flex-col jwt-min-h-screen jwt-bg-gray-50">
      <Topbar discount={discount} currentPage={currentPage} onPageChange={handlePageChange} />
      <main className="jwt-flex-1 jwt-p-6 sm:jwt-p-8 lg:jwt-p-12 jwt-container jwt-mx-auto">
        {renderPage()}
      </main>
      <FloatingSurveyCTA
        isVisible={isSurveyCtaVisible && currentPage !== 'survey'}
        onClose={() => {
          setIsSurveyCtaVisible(false)
          setIsUserDismissed(true)
        }}
        onTakeSurvey={() => handlePageChange('survey')}
      />
    </div>
  )
}
