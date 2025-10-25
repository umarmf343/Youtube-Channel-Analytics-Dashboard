"use client"

import { useContext, useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AppContext } from "@/lib/context"
import type { CompetitorAnalysisResponse, CompetitorChannelMetrics } from "@/lib/types"
import { fetchCompetitorAnalysis, fetchCompetitorKeywords } from "@/lib/youtube-api"
import { cn, formatNumber } from "@/lib/utils"

const DEFAULT_COMPETITORS = ["@thinkmedia", "@aliabdaal"]
const MAX_COMPETITORS = 5

type KeywordState = Record<string, string[]>

type SummaryMetric = {
  label: string
  baseValue: number
  competitorValue: number
  formatter?: (value: number) => string
  suffix?: string
}

export default function CompetitorTracker() {
  const appContext = useContext(AppContext)
  const user = appContext?.user

  const [competitorInput, setCompetitorInput] = useState("")
  const [competitors, setCompetitors] = useState<string[]>(DEFAULT_COMPETITORS)
  const [analysis, setAnalysis] = useState<CompetitorAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null)
  const [keywordsByCompetitor, setKeywordsByCompetitor] = useState<KeywordState>({})
  const [isKeywordLoading, setIsKeywordLoading] = useState(false)
  const [keywordError, setKeywordError] = useState<string | null>(null)

  const hasUser = Boolean(user)
  const canAnalyze = hasUser && competitors.length > 0

  const activeCompetitor = useMemo<CompetitorChannelMetrics | null>(() => {
    if (!analysis || !selectedCompetitor) {
      return null
    }

    return (
      analysis.competitors.find((competitor) => competitor.sourceQuery === selectedCompetitor) ??
      analysis.competitors[0] ??
      null
    )
  }, [analysis, selectedCompetitor])

  const summaryCards = useMemo<SummaryMetric[]>(() => {
    if (!analysis) return []
    const competitorAverageSubscribers =
      analysis.competitors.reduce((total, competitor) => total + competitor.subscribers, 0) /
        Math.max(analysis.competitors.length, 1) || 0
    const competitorAverageViews =
      analysis.competitors.reduce((total, competitor) => total + competitor.averageViews, 0) /
        Math.max(analysis.competitors.length, 1) || 0
    const competitorAverageEngagement =
      analysis.competitors.reduce((total, competitor) => total + competitor.engagementRate, 0) /
        Math.max(analysis.competitors.length, 1) || 0

    return [
      {
        label: "Subscribers gap",
        baseValue: analysis.baseChannel.subscribers,
        competitorValue: Math.round(competitorAverageSubscribers),
        formatter: formatNumber,
      },
      {
        label: "Average views",
        baseValue: analysis.baseChannel.averageViews,
        competitorValue: Math.round(competitorAverageViews),
        formatter: formatNumber,
      },
      {
        label: "Engagement rate",
        baseValue: analysis.baseChannel.engagementRate,
        competitorValue: Math.round(competitorAverageEngagement * 10) / 10,
        suffix: "%",
      },
    ]
  }, [analysis])

  useEffect(() => {
    if (!analysis || !analysis.competitors.length) {
      setSelectedCompetitor(null)
      return
    }

    setSelectedCompetitor((current) => {
      if (current && analysis.competitors.some((competitor) => competitor.sourceQuery === current)) {
        return current
      }
      return analysis.competitors[0]?.sourceQuery ?? null
    })
  }, [analysis])

  useEffect(() => {
    if (!selectedCompetitor || keywordsByCompetitor[selectedCompetitor]) {
      return
    }

    setIsKeywordLoading(true)
    setKeywordError(null)

    fetchCompetitorKeywords(selectedCompetitor)
      .then((keywords) => {
        setKeywordsByCompetitor((previous) => ({ ...previous, [selectedCompetitor]: keywords }))
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Unable to load competitor keywords"
        setKeywordError(message)
      })
      .finally(() => {
        setIsKeywordLoading(false)
      })
  }, [keywordsByCompetitor, selectedCompetitor])

  const handleAddCompetitor = () => {
    const trimmed = competitorInput.trim()
    if (!trimmed) {
      setCompetitorInput("")
      return
    }

    if (competitors.length >= MAX_COMPETITORS) {
      setError(`You can compare up to ${MAX_COMPETITORS} channels at once.`)
      return
    }

    if (competitors.some((value) => value.toLowerCase() === trimmed.toLowerCase())) {
      setCompetitorInput("")
      return
    }

    setError(null)
    setAnalysis(null)
    setSelectedCompetitor(null)
    setKeywordsByCompetitor({})
    setCompetitors((previous) => [...previous, trimmed])
    setCompetitorInput("")
  }

  const handleRemoveCompetitor = (handle: string) => {
    setCompetitors((previous) => previous.filter((value) => value !== handle))
    setAnalysis(null)
    setSelectedCompetitor((current) => (current === handle ? null : current))
    setError(null)
    setKeywordsByCompetitor((previous) => {
      const { [handle]: _removed, ...rest } = previous
      return rest
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canAnalyze || !user) {
      setError("Log in and add at least one competitor to generate insights")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchCompetitorAnalysis({
        channel: {
          id: user.id,
          channelId: user.channelId,
          channelName: user.channelName,
          subscribers: user.subscribers,
          totalViews: user.totalViews,
        },
        competitors,
      })

      setAnalysis(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to generate competitor analysis"
      setError(message)
      setAnalysis(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Competitor Analysis</h2>
        <p className="text-muted-foreground">
          Monitor channels in your niche, uncover content gaps, and identify strategies that are driving growth.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Track competitor channels</CardTitle>
          <CardDescription>
            Add up to five channels to benchmark against {user?.channelName ?? "your channel"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder="e.g. @googledevelopers"
                value={competitorInput}
                onChange={(event) => setCompetitorInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleAddCompetitor()
                  }
                }}
                disabled={isLoading}
                className="bg-input"
              />
              <Button type="button" variant="secondary" onClick={handleAddCompetitor} disabled={isLoading}>
                Add
              </Button>
            </div>
            <Button type="submit" disabled={!canAnalyze || isLoading}>
              {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Generate analysis
            </Button>
          </form>

          {competitors.length ? (
            <div className="flex flex-wrap gap-2">
              {competitors.map((handle) => (
                <Badge
                  key={handle}
                  variant="secondary"
                  className="flex items-center gap-2 text-sm"
                >
                  {handle}
                  <button
                    type="button"
                    onClick={() => handleRemoveCompetitor(handle)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${handle}`}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Add competitor handles to begin tracking performance.</p>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="border-border/50">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Spinner className="h-5 w-5" />
              <p>Crunching the numbers…</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!hasUser ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="py-12 text-center text-muted-foreground">
            Sign in to analyze competitor performance against your channel.
          </CardContent>
        </Card>
      ) : null}

      {analysis && !isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {summaryCards.map((metric) => {
              const delta = metric.competitorValue - metric.baseValue
              const formatter = metric.formatter ?? ((value: number) => value.toLocaleString())
              const formatValue = (value: number) => `${formatter(value)}${metric.suffix ?? ""}`

              return (
                <Card key={metric.label} className="border-border/50">
                  <CardHeader>
                    <CardDescription>{metric.label}</CardDescription>
                    <CardTitle className="flex items-baseline gap-2 text-2xl">
                      {formatValue(metric.baseValue)}
                      <span
                        className={cn(
                          "text-sm font-medium",
                          delta > 0 ? "text-emerald-500" : delta < 0 ? "text-amber-500" : "text-muted-foreground",
                        )}
                      >
                        {delta === 0 ? "on par" : `${delta > 0 ? "-" : "+"}${formatValue(Math.abs(delta))}`}
                      </span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Avg competitor: {formatValue(metric.competitorValue)}</p>
                  </CardHeader>
                </Card>
              )
            })}
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Channel performance benchmarks</CardTitle>
              <CardDescription>Compare upload cadence, engagement, and growth across tracked channels.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[420px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Channel</TableHead>
                      <TableHead className="text-right">Subscribers</TableHead>
                      <TableHead className="text-right">Avg views</TableHead>
                      <TableHead className="text-right">Engagement</TableHead>
                      <TableHead className="text-right">Uploads/mo</TableHead>
                      <TableHead className="text-right">Growth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[analysis.baseChannel, ...analysis.competitors].map((channel, index) => {
                      const isBase = index === 0
                      return (
                        <TableRow
                          key={`${channel.id}-${channel.sourceQuery}-${index}`}
                          className={cn(isBase ? "bg-muted/40" : "", "cursor-pointer")}
                          onClick={() => setSelectedCompetitor(channel.sourceQuery)}
                        >
                          <TableCell className="font-medium">
                            {isBase ? (
                              <span className="flex items-center gap-2">
                                <Badge variant="outline">You</Badge>
                                {channel.name}
                              </span>
                            ) : (
                              channel.name
                            )}
                          </TableCell>
                          <TableCell className="text-right">{formatNumber(channel.subscribers)}</TableCell>
                          <TableCell className="text-right">{formatNumber(channel.averageViews)}</TableCell>
                          <TableCell className="text-right">{channel.engagementRate.toFixed(1)}%</TableCell>
                          <TableCell className="text-right">{channel.uploadFrequency.toFixed(1)}</TableCell>
                          <TableCell
                            className={cn(
                              "text-right",
                              channel.growthRate > 0 ? "text-emerald-500" : channel.growthRate < 0 ? "text-amber-500" : "",
                            )}
                          >
                            {channel.growthRate > 0 ? "+" : ""}
                            {channel.growthRate.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Content gaps</CardTitle>
                <CardDescription>Topics competitors cover that your channel has yet to own.</CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.insights.contentGaps.length ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.insights.contentGaps.map((gap) => (
                      <Badge key={gap} variant="secondary" className="text-sm">
                        {gap}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No major gaps detected.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Trending across competitors</CardTitle>
                <CardDescription>Rising topics and themes driving views.</CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.insights.trendingTopics.length ? (
                  <ol className="space-y-2 text-sm text-foreground">
                    {analysis.insights.trendingTopics.map((topic, index) => (
                      <li key={topic} className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {index + 1}
                        </span>
                        {topic}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-muted-foreground">Not enough data to surface trends yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Recommended actions</CardTitle>
                <CardDescription>High-impact suggestions generated from the comparison.</CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.insights.actionItems.length ? (
                  <ul className="space-y-2 text-sm text-foreground">
                    {analysis.insights.actionItems.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Your channel is keeping pace with tracked competitors.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {activeCompetitor ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Top videos: {activeCompetitor.name}</CardTitle>
                  <CardDescription>High-performing uploads for inspiration.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeCompetitor.topVideos.length ? (
                    activeCompetitor.topVideos.map((video) => (
                      <div key={video.id} className="space-y-2 rounded-md border border-border/60 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-medium text-foreground line-clamp-2">{video.title}</p>
                          <Badge variant="outline">{formatNumber(video.views)} views</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {new Date(video.uploadDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No public videos detected for this channel.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Keyword advantage</CardTitle>
                  <CardDescription>Search terms {activeCompetitor.name} ranks for.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isKeywordLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Spinner className="h-4 w-4" /> Loading keyword insights…
                    </div>
                  ) : keywordError ? (
                    <p className="text-sm text-destructive">{keywordError}</p>
                  ) : (keywordsByCompetitor[selectedCompetitor ?? ""]?.length ?? 0) > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {keywordsByCompetitor[selectedCompetitor ?? ""].map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="text-sm">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No keyword insights available yet.</p>
                  )}
                  <Separator />
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>Click a channel row to refresh these insights.</p>
                    <p>Use emerging keywords to guide your next scripts or thumbnails.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
