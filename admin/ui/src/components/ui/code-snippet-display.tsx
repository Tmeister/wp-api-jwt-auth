import { useState } from 'react'
import { CheckCircle, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeSnippetDisplayProps {
  code: string
  language: string
}

export const CodeSnippetDisplay = ({ code, language }: CodeSnippetDisplayProps) => {
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
