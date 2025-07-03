import { useState, useMemo, useEffect } from "react"
import { Topbar } from "./dashboard/topbar"
import { OverviewPage } from "./dashboard/overview-page"
import { GoProPage } from "./dashboard/go-pro-page"
import { wordpressAPI, type ConfigurationStatus } from "@/lib/wordpress-api"

// --- TYPES ---

type Page = "overview" | "go-pro"

// --- MAIN DASHBOARD COMPONENT ---

export default function Dashboard() {
  const [activePage, setActivePage] = useState<Page>("overview")
  const [shareData, setShareData] = useState(false)
  const [configStatus, setConfigStatus] = useState<ConfigurationStatus | null>(null)

  // Load settings from WordPress on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Load both settings and configuration status in parallel
        const [settings, status] = await Promise.all([
          wordpressAPI.getSettings(),
          wordpressAPI.getConfigurationStatus()
        ])

        setShareData(settings.share_data)
        setConfigStatus(status)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }

    loadData()
  }, [])

  // Update share data setting when toggled
  const handleShareDataChange = async (newValue: boolean) => {
    setShareData(newValue)
    try {
      await wordpressAPI.updateSettings({
        share_data: newValue,
      })
    } catch (error) {
      console.error('Failed to update share data setting:', error)
      // Revert on error
      setShareData(!newValue)
    }
  }

  const discount = useMemo(() => {
    let total = 40
    if (shareData) total += 10
    return total
  }, [shareData])

  const pageProps = {
    shareData,
    setShareData: handleShareDataChange,
    configStatus,
  }

  const renderPage = () => {
    switch (activePage) {
      case "overview":
        return <OverviewPage {...pageProps} />
      case "go-pro":
        return <GoProPage discount={discount} />
      default:
        return <OverviewPage {...pageProps} />
    }
  }

  return (
    <div className="jwt-flex jwt-flex-col jwt-min-h-screen jwt-bg-gray-50">
      <Topbar activePage={activePage} setActivePage={setActivePage} discount={discount} />
      <main className="jwt-flex-1 jwt-p-4 sm:jwt-p-6 lg:jwt-p-8 jwt-container jwt-mx-auto">{renderPage()}</main>
    </div>
  )
}
