"use client"

import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchTrendAlerts, type TrendAlert } from "@/lib/youtube-api"

const niches = ["technology", "business", "lifestyle"] as const

const stageStyles: Record<TrendAlert["stage"], string> = {
  Emerging: "border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  Surging: "border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  Peaking: "border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300",
}

export default function TrendAlerts() {
  const [selectedNiche, setSelectedNiche] = useState<(typeof niches)[number]>("technology")
  const [alerts, setAlerts] = useState<TrendAlert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadAlerts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchTrendAlerts(selectedNiche)
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
  }, [selectedNiche])

  const headlineAlert = useMemo(() => {
    if (!alerts.length) {
      return null
    }

    return alerts.reduce((top, current) => {
      if (!top) return current
      return current.momentumScore > top.momentumScore ? current : top
    }, alerts[0])
  }, [alerts])

  const metrics = useMemo(() => {
    if (!alerts.length) {
      return null
    }

    const totals = alerts.reduce(
      (acc, alert) => {
        acc.momentum += alert.momentumScore
        acc.confidence += alert.confidence
        acc.publishedGrowth += alert.publishedGrowth
        acc.velocity = Math.max(acc.velocity, alert.velocity)
        return acc
      },
      { momentum: 0, confidence: 0, publishedGrowth: 0, velocity: 0 },
    )

    const count = alerts.length

    return {
      averageMomentum: Math.round(totals.momentum / count),
      averageConfidence: Math.round(totals.confidence / count),
      averagePublishedGrowth: Math.round(totals.publishedGrowth / count),
      maxVelocity: totals.velocity,
    }
  }, [alerts])

  const renderAlerts = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 py-12">
          <Spinner className="mr-2 h-6 w-6" />
          <span className="text-muted-foreground">Scanning YouTube for fresh signals…</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )
    }

    if (!alerts.length) {
      return (
        <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
          No alerts available right now. Check back soon for emerging opportunities.
        </div>
      )
    }

    return (
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          {alerts.map((alert) => (
            <Card key={alert.id} className="border-border/50 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`${stageStyles[alert.stage]} text-xs font-semibold uppercase tracking-wide`}>
                        {alert.stage}
                      </Badge>
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        Momentum {alert.momentumScore}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Opportunity: {alert.opportunityWindow}
                      </span>
                    </div>
                    <CardTitle className="text-2xl text-foreground">{alert.topic}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground/90">
                      {alert.summary}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right text-sm text-muted-foreground">
                    <span>
                      Velocity <span className="font-semibold text-foreground">{alert.velocity}%</span>
                    </span>
                    <span>
                      24h Mentions <span className="font-semibold text-foreground">{alert.last24hMentions.toLocaleString()}</span>
                    </span>
                    <span>
                      Confidence <span className="font-semibold text-foreground">{alert.confidence}%</span>
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {alert.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="capitalize">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border/40 bg-muted/40 p-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Momentum</p>
                    <p className="text-lg font-semibold text-foreground">{alert.momentumScore}</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-muted/40 p-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Published Growth</p>
                    <p className="text-lg font-semibold text-foreground">{alert.publishedGrowth}%</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-muted/40 p-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Confidence</p>
                    <p className="text-lg font-semibold text-foreground">{alert.confidence}%</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Recommended actions</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {alert.recommendedActions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {headlineAlert && metrics ? (
          <div className="space-y-5">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Opportunity outlook</CardTitle>
                <CardDescription>
                  Key signals for the <span className="font-medium text-foreground">{selectedNiche}</span> niche
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/40 p-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Average momentum</p>
                    <p className="text-lg font-semibold text-foreground">{metrics.averageMomentum}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Top velocity</p>
                    <p className="text-lg font-semibold text-foreground">{metrics.maxVelocity}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/40 p-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Avg. confidence</p>
                    <p className="text-lg font-semibold text-foreground">{metrics.averageConfidence}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Avg. growth</p>
                    <p className="text-lg font-semibold text-foreground">{metrics.averagePublishedGrowth}%</p>
                  </div>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                  <p className="text-xs font-semibold uppercase text-primary">Top pick</p>
                  <p className="text-base font-semibold text-foreground">{headlineAlert.topic}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{headlineAlert.summary}</p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                    Publish window: {headlineAlert.opportunityWindow}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Action prompts</CardTitle>
                <CardDescription>Ideas to capture the surge</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  <li>
                    Batch scripts or outlines today while momentum averages {metrics.averageMomentum} across alerts.
                  </li>
                  <li>
                    Schedule at least one upload within {headlineAlert.opportunityWindow.toLowerCase()} to ride the velocity peak.
                  </li>
                  <li>
                    Repurpose shorts or community posts showcasing {headlineAlert.keywords[0]} to reinforce awareness.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Trend Alerts</h1>
        <p className="text-muted-foreground">
          Spot emerging topics in your niche and line up timely content before the wave crests.
        </p>
      </div>

      <Tabs value={selectedNiche} onValueChange={(value) => setSelectedNiche(value as (typeof niches)[number])} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-fit">
          {niches.map((niche) => (
            <TabsTrigger key={niche} value={niche} className="capitalize">
              {niche}
            </TabsTrigger>
          ))}
        </TabsList>
        {niches.map((niche) => (
          <TabsContent key={niche} value={niche} className="space-y-6">
            {niche === selectedNiche ? renderAlerts() : null}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
