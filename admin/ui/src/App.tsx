import React from 'react'
import { DataSharingOptIn } from '@/components/DataSharingOptIn'
import '@/styles/globals.css'

const App: React.FC = () => {
  return (
    <div className="jwt-min-h-screen jwt-bg-gray-50">
      <DataSharingOptIn />
    </div>
  )
}

export default App