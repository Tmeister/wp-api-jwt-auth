import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Ensure the mount point exists
const container = document.getElementById('jwt-auth-holder')

if (container) {
  const root = ReactDOM.createRoot(container)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} else {
  console.error('JWT Auth: Mount point #jwt-auth-holder not found')
}
