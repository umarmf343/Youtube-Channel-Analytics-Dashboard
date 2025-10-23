"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: any) => void
  isOpen: boolean
}

const menuItems = [
  { id: "home", label: "Dashboard", icon: "📊" },
  { id: "channel", label: "Channel Center", icon: "🛰️" },
  { id: "keywords", label: "Keyword Tools", icon: "🔍" },
  { id: "ai-seo", label: "AI SEO Studio", icon: "🤖" },
  { id: "shorts", label: "Shorts Studio", icon: "🎬" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "competitors", label: "Competitors", icon: "🎯" },
  { id: "optimization", label: "Optimization", icon: "✨" },
  { id: "trending", label: "Trending", icon: "🔥" },
  { id: "automation", label: "Automation Hub", icon: "⚙️" },
  { id: "export", label: "Export", icon: "📥" },
]

export default function Sidebar({ currentPage, onPageChange, isOpen }: SidebarProps) {
  return (
    <aside
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-20",
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-sidebar-primary-foreground">VI</span>
          </div>
          {isOpen && <span className="font-bold text-sidebar-foreground text-lg">VidIStream</span>}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            variant={currentPage === item.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3",
              currentPage === item.id
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent",
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {isOpen && <span className="truncate">{item.label}</span>}
          </Button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/60 text-center">{isOpen && <p>VidIStream Pro</p>}</div>
      </div>
    </aside>
  )
}
