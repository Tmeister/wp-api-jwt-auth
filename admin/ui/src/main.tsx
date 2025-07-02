import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Ensure the mount point exists
const container = document.getElementById('jwt-auth-holder')

if (container) {
  // Use React 18 createRoot API with fallback for older versions
  if ('createRoot' in ReactDOM) {
    const root = ReactDOM.createRoot(container)
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  } else {
    // Fallback for React 17 and below
    ;(ReactDOM as any).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      container
    )
  }
} else {
  console.error('JWT Auth: Mount point #jwt-auth-holder not found')
}