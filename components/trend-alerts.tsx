"use client"

import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import type { TrendAlert } from "@/lib/types"
import { fetchTrendAlerts } from "@/lib/youtube-api"

const categories = [
  { value: "technology", label: "Tech & AI Creators" },
  { value: "business", label: "Business & Finance" },
  { value: "lifestyle", label: "Lifestyle & Wellness" },
]

const velocityStyles: Record<TrendAlert["velocity"], string> = {
  surging: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  rising: "bg-sky-500/15 text-sky-600 border-sky-500/20",
  emerging: "bg-amber-500/15 text-amber-600 border-amber-500/20",
}

const impactStyles: Record<TrendAlert["impactLevel"], string> = {
  High: "bg-rose-500/15 text-rose-600 border-rose-500/20",
  Medium: "bg-blue-500/15 text-blue-600 border-blue-500/20",
  Watch: "bg-slate-500/15 text-slate-600 border-slate-500/20",
}

export default function TrendAlerts() {
  const [alerts, setAlerts] = useState<TrendAlert[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.value ?? "technology")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadAlerts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchTrendAlerts(selectedCategory)
        if (isMounted) {
          setAlerts(data)
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Unable to load trend alerts"
          setError(message)
          setAlerts([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAlerts()

    return () => {
      isMounted = false
    }
  }, [selectedCategory])

  const sortedAlerts = useMemo(() => alerts.slice().sort((a, b) => b.momentumScore - a.momentumScore), [alerts])
  const topAlert = sortedAlerts[0]

  const summary = useMemo(() => {
    if (!sortedAlerts.length) {
      return { highImpact: 0, avgMomentum: 0, opportunityWindow: "—", trendingTopic: "—" }
    }

    const highImpact = sortedAlerts.filter((alert) => alert.impactLevel === "High").length
    const avgMomentum = Math.round(
      sortedAlerts.reduce((acc, alert) => acc + alert.momentumScore, 0) / sortedAlerts.length,
    )

    return {
      highImpact,
      avgMomentum,
      opportunityWindow: sortedAlerts[0].opportunityWindow,
      trendingTopic: sortedAlerts[0].topic,
    }
  }, [sortedAlerts])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trend Alerts</h1>
          <p className="text-muted-foreground">
            Detect breakout topics in your niche and act while the opportunity window is open.
          </p>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="min-w-[220px]">
            <SelectValue placeholder="Select a niche" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border/50 py-16 text-muted-foreground">
          <Spinner className="mr-3 h-5 w-5" />
          <span>Analyzing trend signals…</span>
        </div>
      ) : sortedAlerts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 p-8 text-center text-muted-foreground">
          No emerging topics detected for this niche right now. Check back soon for fresh alerts.
        </div>
      ) : (
        <>
          {topAlert ? (
            <Card className="border-border/50">
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl text-foreground">
                      Top opportunity: {topAlert.topic}
                    </CardTitle>
                    <CardDescription>{topAlert.summary}</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={velocityStyles[topAlert.velocity]}>
                      {formatVelocity(topAlert.velocity)} momentum
                    </Badge>
                    <Badge className={impactStyles[topAlert.impactLevel]}>
                      Impact: {topAlert.impactLevel}
                    </Badge>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      Window: {topAlert.opportunityWindow}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <SummaryMetric
                    label="High-impact alerts"
                    value={`${summary.highImpact}`}
                    helper="Require fast action"
                  />
                  <SummaryMetric
                    label="Avg. momentum"
                    value={`${summary.avgMomentum}/100`}
                    helper="Across current alerts"
                  />
                  <SummaryMetric
                    label="Opportunity window"
                    value={topAlert.opportunityWindow}
                    helper={`Led by ${topAlert.topic}`}
                  />
                  <SummaryMetric
                    label="Last updated"
                    value={formatLastUpdated(topAlert.lastUpdated)}
                    helper="Local time"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <SummaryMetric
                    label="24h search lift"
                    value={`+${topAlert.change24h}%`}
                    helper="vs previous day"
                  />
                  <SummaryMetric
                    label="7-day growth"
                    value={`+${topAlert.change7d}%`}
                    helper="Organic interest"
                  />
                  <SummaryMetric
                    label="Search volume"
                    value={formatNumber(topAlert.searchVolume)}
                    helper="Monthly searches"
                  />
                  <SummaryMetric
                    label="Projected views"
                    value={formatNumber(topAlert.projectedViews)}
                    helper="If you publish now"
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          <ScrollArea className="max-h-[calc(100vh-320px)] pr-2">
            <div className="space-y-4 pt-2">
              {sortedAlerts.map((alert) => (
                <Card key={alert.id} className="border-border/40">
                  <CardHeader className="space-y-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl text-foreground">{alert.topic}</CardTitle>
                        <CardDescription>{alert.summary}</CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={velocityStyles[alert.velocity]}>{formatVelocity(alert.velocity)}</Badge>
                        <Badge className={impactStyles[alert.impactLevel]}>Impact: {alert.impactLevel}</Badge>
                        <Badge variant="secondary">{alert.opportunityWindow}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Momentum score
                        </p>
                        <div className="mt-2 flex items-baseline justify-between gap-2">
                          <span className="text-xl font-semibold text-foreground">{alert.momentumScore}</span>
                          <span className="text-xs text-muted-foreground">/ 100</span>
                        </div>
                        <Progress value={alert.momentumScore} className="mt-3 h-1.5" />
                      </div>
                      <MetricCard label="24h search lift" value={`+${alert.change24h}%`} helper="vs previous day" />
                      <MetricCard label="Projected views" value={formatNumber(alert.projectedViews)} helper="If you publish now" />
                      <MetricCard
                        label="Competition"
                        value={`${alert.competition}% (${competitionLabel(alert.competition)})`}
                        helper="Lower is better"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">Action plan</p>
                      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                        {alert.recommendedActions.map((action, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Related keywords:</p>
                      {alert.relatedKeywords.length ? (
                        alert.relatedKeywords.map((keyword) => (
                          <Badge key={`${alert.id}-${keyword}`} variant="outline">
                            {keyword}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">{alert.topic}</Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Updated {formatLastUpdated(alert.lastUpdated)} • Momentum score {alert.momentumScore}/100
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  )
}

function formatVelocity(velocity: TrendAlert["velocity"]): string {
  switch (velocity) {
    case "surging":
      return "Surging"
    case "rising":
      return "Rising"
    default:
      return "Emerging"
  }
}

function competitionLabel(score: number): string {
  if (score < 40) return "Low"
  if (score < 65) return "Moderate"
  return "High"
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

function formatLastUpdated(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function SummaryMetric({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  )
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  )
}
