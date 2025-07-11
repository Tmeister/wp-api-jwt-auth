import { useState } from 'react'
import { CheckCircle, Loader2, Copy, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
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
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { CodeSnippetDisplay } from '@/components/ui/code-snippet-display'
import { getCodeSnippets } from '@/lib/api-code-snippets'

interface ApiResponse {
  error?: string
  details?: Record<string, unknown>
  [key: string]: unknown
}

export const LiveApiExplorer = () => {
  const [endpoint, setEndpoint] = useState('/jwt-auth/v1/token')
  const [username, setUsername] = useState('testuser')
  const [password, setPassword] = useState('password')
  const [token, setToken] = useState('your-jwt-token')
  const [isLoading, setIsLoading] = useState(false)
  const [responseCopied, setResponseCopied] = useState(false)
  const [tokenAutoFilled, setTokenAutoFilled] = useState(false)
  const [tokenResponse, setTokenResponse] = useState<ApiResponse | null>(null)
  const [validateResponse, setValidateResponse] = useState<ApiResponse | null>(null)

  // Get WordPress site URL from config
  const siteUrl = window.jwtAuthConfig?.siteUrl || 'https://yoursite.com'

  const handleEndpointChange = (newEndpoint: string) => {
    setEndpoint(newEndpoint)
    // Clear token auto-fill notifications when switching endpoints
    setTokenAutoFilled(false)
  }

  // Get the current response based on selected endpoint
  const getCurrentResponse = () => {
    return endpoint === '/jwt-auth/v1/token' ? tokenResponse : validateResponse
  }

  // Set the response for the current endpoint
  const setCurrentResponse = (response: ApiResponse | null) => {
    if (endpoint === '/jwt-auth/v1/token') {
      setTokenResponse(response)
    } else {
      setValidateResponse(response)
    }
  }

  const handleSend = async () => {
    setIsLoading(true)
    setCurrentResponse(null)

    try {
      const fullUrl = `${siteUrl}/wp-json${endpoint}`

      // Prepare request headers and body based on endpoint
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      let requestBody: object = {}

      if (endpoint === '/jwt-auth/v1/token') {
        if (!username.trim() || !password.trim()) {
          setCurrentResponse({
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
          setCurrentResponse({
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
        setCurrentResponse(data)

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
          setCurrentResponse({
            error: `HTTP ${response.status}: ${errorData.message || response.statusText}`,
            details: errorData,
          })
        } catch {
          setCurrentResponse({
            error: `HTTP ${response.status}: ${response.statusText}`,
          })
        }
      }
    } catch (error) {
      setCurrentResponse({
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const snippets = getCodeSnippets(endpoint, siteUrl, username, password, token)

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
            <Select defaultValue="/jwt-auth/v1/token" onValueChange={handleEndpointChange}>
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
                        className="!jwt-border-input !jwt-rounded-md !focus:jwt-shadow-none"
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
              {getCurrentResponse() && (
                <div className="jwt-mb-4">
                  {getCurrentResponse()?.error ? (
                    <div className="jwt-border-l-4 jwt-border-red-400 jwt-bg-red-50 jwt-p-4">
                      <div className="jwt-flex">
                        <div className="jwt-shrink-0">
                          <X className="jwt-h-5 jwt-w-5 jwt-text-red-400" />
                        </div>
                        <div className="jwt-ml-3">
                          <p className="jwt-text-sm jwt-text-red-700">
                            <span className="jwt-font-medium">Request Failed:</span>{' '}
                            {String(getCurrentResponse()?.error)}
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
              {getCurrentResponse() && (
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
                        {JSON.stringify(getCurrentResponse(), null, 2)}
                      </SyntaxHighlighter>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="jwt-absolute jwt-top-3 jwt-right-3 jwt-h-8 jwt-w-8"
                      onClick={() => {
                        const text = JSON.stringify(getCurrentResponse(), null, 2)
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
              {!isLoading && !getCurrentResponse() && (
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
