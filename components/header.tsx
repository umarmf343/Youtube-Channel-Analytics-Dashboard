"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { User } from "@/lib/types"

interface HeaderProps {
  user: User
  onLogout: () => void
  onMenuClick: () => void
}

export default function Header({ user, onLogout, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          ☰
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">VidIStream</h1>
          <p className="text-sm text-muted-foreground">{user.channelName}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.subscribers.toLocaleString()} subscribers</p>
        </div>
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <Button onClick={onLogout} variant="outline" size="sm">
          Logout
        </Button>
      </div>
    </header>
  )
}
