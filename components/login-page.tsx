"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/lib/types"
import { fetchChannelProfile } from "@/lib/youtube-api"
import { Spinner } from "@/components/ui/spinner"

interface LoginPageProps {
  onLogin: (user: User) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!query.trim()) {
      setError("Enter a channel name, handle, or ID")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const profile = await fetchChannelProfile(query.trim())
      onLogin(profile)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load channel"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary mb-4">
            <span className="text-2xl font-bold text-primary-foreground">VI</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">VidIStream</h1>
          <p className="text-muted-foreground">Connect your channel to explore live analytics</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Connect your YouTube channel</CardTitle>
            <CardDescription>Enter a channel name, handle, or ID to pull live metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Channel</label>
                <Input
                  placeholder="e.g. @googledevelopers or Tech Insights"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="bg-input border-border"
                  disabled={isLoading}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Fetch channel data
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          VidIStream now relies entirely on the live YouTube Data API.
        </div>
      </div>
    </div>
  )
}
