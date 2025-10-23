"use client"

import { useState } from "react"
import type { User } from "@/lib/types"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import DashboardHome from "@/components/dashboard-home"
import KeywordTools from "@/components/keyword-tools"
import AnalyticsPage from "@/components/analytics-page"
import CompetitorTracker from "@/components/competitor-tracker"
import VideoOptimization from "@/components/video-optimization"
import TrendingKeywordsPage from "@/components/trending-keywords-page"
import ExportDataPage from "@/components/export-data-page"
import ChannelCommandCenter from "@/components/channel-command-center"
import AiSeoStudio from "@/components/ai-seo-studio"
import ShortsStudio from "@/components/shorts-studio"
import AutomationHub from "@/components/automation-hub"

interface DashboardProps {
  user: User
  onLogout: () => void
}

type Page =
  | "home"
  | "keywords"
  | "analytics"
  | "competitors"
  | "optimization"
  | "trending"
  | "export"
  | "channel"
  | "ai-seo"
  | "shorts"
  | "automation"

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>("home")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderPage = () => {
    switch (currentPage) {
      case "keywords":
        return <KeywordTools />
      case "analytics":
        return <AnalyticsPage />
      case "competitors":
        return <CompetitorTracker />
      case "optimization":
        return <VideoOptimization />
      case "trending":
        return <TrendingKeywordsPage />
      case "export":
        return <ExportDataPage />
      case "channel":
        return <ChannelCommandCenter />
      case "ai-seo":
        return <AiSeoStudio />
      case "shorts":
        return <ShortsStudio />
      case "automation":
        return <AutomationHub />
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
