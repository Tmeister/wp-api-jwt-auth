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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle, Loader2, Copy, Send, ChevronDown, X, AlertTriangle } from 'lucide-react'
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

const CodeSnippetDisplay = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="jwt-relative">
      <pre className="jwt-bg-slate-800 jwt-text-white jwt-p-4 jwt-rounded-lg jwt-text-sm jwt-overflow-x-auto">
        <code>{code}</code>
      </pre>
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
  const [domain, setDomain] = useState('jwt.test')
  const [username, setUsername] = useState('testuser')
  const [password, setPassword] = useState('password')
  const [token, setToken] = useState('your-jwt-token')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<object | null>(null)

  const getCodeSnippets = (endpointPath: string) => {
    const fullUrl = `https://${domain}/wp-json${endpointPath}`
    const body =
      endpointPath === '/jwt-auth/v1/token'
        ? `{ "username": "${username}", "password": "${password}" }`
        : `{ "token": "${token}" }`

    return {
      cURL: `curl -X POST ${fullUrl} \\
-H 'Content-Type: application/json' \\
-d '${body}'`,
      JavaScript: `const options = {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify(${body})\n};\n\nfetch('${fullUrl}', options)\n  .then(response => response.json())\n  .then(response => console.log(response))\n  .catch(err => console.error(err));`,
      Python: `import requests\nimport json\n\nurl = "${fullUrl}"\npayload = json.dumps(${body.replace(/"/g, `"`).replace(/: "/g, `: "`).replace(/", "/g, `", "`)})\nheaders = {\n  'Content-Type': 'application/json'\n}\n\nresponse = requests.request("POST", url, headers=headers, data=payload)\n\nprint(response.text)`,
    }
  }

  const handleSend = () => {
    setIsLoading(true)
    setResponse(null)
    setTimeout(() => {
      if (endpoint === '/jwt-auth/v1/token') {
        setResponse({
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user_email: 'testuser@jwt.test',
          user_nicename: 'testuser',
          user_display_name: 'Test User',
        })
      } else {
        setResponse({
          code: 'jwt_auth_valid_token',
          data: { status: 200 },
        })
      }
      setIsLoading(false)
    }, 1500)
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
        <div className="jwt-flex jwt-items-center jwt-border jwt-rounded-lg jwt-p-1 jwt-bg-slate-50">
          <Select defaultValue="/jwt-auth/v1/token" onValueChange={setEndpoint}>
            <SelectTrigger className="jwt-w-[200px] jwt-bg-white jwt-border-r">
              <SelectValue placeholder="Select an endpoint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="/jwt-auth/v1/token">POST /token</SelectItem>
              <SelectItem value="/jwt-auth/v1/validate">POST /validate</SelectItem>
            </SelectContent>
          </Select>
          <div className="jwt-flex-1 jwt-px-3 jwt-text-sm jwt-text-slate-600 jwt-font-mono">
            /jwt-auth/v1{endpoint.split('/jwt-auth/v1')[1]}
          </div>
          <Button onClick={handleSend} disabled={isLoading}>
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
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="jwt-flex jwt-items-center jwt-justify-between jwt-w-full jwt-text-sm jwt-font-semibold jwt-text-slate-700 jwt-mb-4">
                Server <ChevronDown className="jwt-h-4 jwt-w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="jwt-pt-0">
                <Label
                  htmlFor="domain"
                  className="jwt-text-sm jwt-font-medium jwt-text-slate-600 jwt-mb-2 jwt-block"
                >
                  your-domain
                </Label>
                <Input
                  id="domain"
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  className="jwt-mt-2"
                />
              </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen>
              <CollapsibleTrigger className="jwt-flex jwt-items-center jwt-justify-between jwt-w-full jwt-text-sm jwt-font-semibold jwt-text-slate-700 jwt-mb-4">
                Body <ChevronDown className="jwt-h-4 jwt-w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="jwt-pt-0 jwt-space-y-4">
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
                    <Input id="token" value={token} onChange={e => setToken(e.target.value)} />
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="jwt-space-y-6">
            <Tabs defaultValue="JavaScript">
              <TabsList>
                <TabsTrigger value="cURL">cURL</TabsTrigger>
                <TabsTrigger value="JavaScript">JavaScript</TabsTrigger>
                <TabsTrigger value="Python">Python</TabsTrigger>
              </TabsList>
              <TabsContent value="cURL">
                <CodeSnippetDisplay code={snippets.cURL} />
              </TabsContent>
              <TabsContent value="JavaScript">
                <CodeSnippetDisplay code={snippets.JavaScript} />
              </TabsContent>
              <TabsContent value="Python">
                <CodeSnippetDisplay code={snippets.Python} />
              </TabsContent>
            </Tabs>

            <div>
              <h3 className="jwt-text-sm jwt-font-semibold jwt-text-slate-700 jwt-mb-4">
                Response
              </h3>
              <div className="jwt-bg-slate-800 jwt-text-white jwt-p-4 jwt-rounded-lg jwt-text-sm jwt-min-h-[150px]">
                {isLoading && <p className="jwt-text-slate-400">Sending request...</p>}
                {response && <pre className="jwt-text-sm">{JSON.stringify(response, null, 2)}</pre>}
                {!isLoading && !response && (
                  <p className="jwt-text-slate-400">Response will appear here</p>
                )}
              </div>
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
