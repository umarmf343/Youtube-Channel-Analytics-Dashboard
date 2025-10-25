"use client"

import { useState } from "react"
import type { User } from "@/lib/types"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import DashboardHome from "@/components/dashboard-home"
import KeywordTools from "@/components/keyword-tools"
import CompetitorTracker from "@/components/competitor-tracker"
import ChannelVideoAnalytics from "@/components/channel-video-analytics"
import TrendingKeywordsPage from "@/components/trending-keywords-page"
import BulkDescriptionEditor from "@/components/bulk-description-editor"

interface DashboardProps {
  user: User
  onLogout: () => void
}

type Page = "home" | "keywords" | "competitors" | "analytics" | "trending" | "videoManager"

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>("home")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderPage = () => {
    switch (currentPage) {
      case "keywords":
        return <KeywordTools />
      case "competitors":
        return <CompetitorTracker />
      case "analytics":
        return <ChannelVideoAnalytics user={user} />
      case "videoManager":
        return <BulkDescriptionEditor user={user} />
      case "trending":
        return <TrendingKeywordsPage />
      default:
        return <DashboardHome user={user} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={onLogout} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">{renderPage()}</main>
      </div>
    </div>
  )
}
