"use client"

import { useState, useEffect } from "react"
import { AppContext } from "@/lib/context"
import type { User } from "@/lib/types"
import Dashboard from "@/components/dashboard"
import LoginPage from "@/components/login-page"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate checking for stored user
    const storedUser = localStorage.getItem("vidstream_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
    localStorage.setItem("vidstream_user", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("vidstream_user")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading VidIStream...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ user, setUser: handleLogin, isAuthenticated: !!user }}>
      {user ? <Dashboard user={user} onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} />}
    </AppContext.Provider>
  )
}
