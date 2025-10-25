"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { fetchCompetitorKeywords } from "@/lib/youtube-api"
import { Spinner } from "@/components/ui/spinner"

export default function CompetitorTracker() {
  const [channel, setChannel] = useState("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!channel.trim()) {
      setError("Enter a competitor channel name or handle")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const results = await fetchCompetitorKeywords(channel.trim())
      setKeywords(results)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load competitor keywords"
      setError(message)
      setKeywords([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Competitor Keyword Insights</h2>
        <p className="text-muted-foreground">Discover the search terms powering other creators in your niche.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Analyze a competitor</CardTitle>
          <CardDescription>Powered by live data from the YouTube Data API</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row">
            <Input
              placeholder="e.g. @googledevelopers"
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
              className="bg-input flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Analyze
            </Button>
          </form>
          {error && <p className="text-sm text-destructive mt-4">{error}</p>}
        </CardContent>
      </Card>

      {keywords.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Top performing keywords</CardTitle>
            <CardDescription>Extracted from the most popular videos on {channel.trim()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-sm">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
