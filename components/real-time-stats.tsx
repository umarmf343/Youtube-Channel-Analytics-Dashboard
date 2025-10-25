"use client"

import { useEffect, useMemo, useState } from "react"
import { TrendingUp, UsersRound } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"

import type { RealTimeStatsPoint, RealTimeStatsSummary, User } from "@/lib/types"
import { fetchRealTimeChannelStats } from "@/lib/youtube-api"
import { Spinner } from "@/components/ui/spinner"

interface RealTimeStatsProps {
  user: User
}

const EMPTY_POINT: RealTimeStatsPoint = {
  timestamp: "",
  label: "",
  views: 0,
  likes: 0,
  comments: 0,
  watchTimeMinutes: 0,
  liveViewers: 0,
}

const DEFAULT_SUMMARY: RealTimeStatsSummary = {
  averageViews: 0,
  engagementRate: 0,
  engagementChange: 0,
  viewsChange: 0,
  watchTimeHours: 0,
  totalEngagement: 0,
  totalViews: 0,
}

export default function RealTimeStats({ user }: RealTimeStatsProps) {
  const [points, setPoints] = useState<RealTimeStatsPoint[]>([])
  const [summary, setSummary] = useState<RealTimeStatsSummary>(DEFAULT_SUMMARY)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadStats = async (withLoader = false) => {
      if (withLoader) {
        setIsLoading(true)
      }

      try {
        const data = await fetchRealTimeChannelStats(user.channelId)
        if (!isMounted) return
        setPoints(data.points)
        setSummary(data.summary)
        setLastUpdated(data.generatedAt)
        setError(null)
      } catch (err) {
        if (!isMounted) return
        const message = err instanceof Error ? err.message : "Unable to load real-time stats"
        setError(message)
        setPoints([])
        setSummary(DEFAULT_SUMMARY)
      } finally {
        if (!isMounted) return
        setIsLoading(false)
      }
    }

    loadStats(true)
    const interval = setInterval(() => loadStats(false), 60_000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [user.channelId])

  const latestPoint = points[points.length - 1] ?? EMPTY_POINT
  const metrics = summary
  const viewsGradientId = useMemo(() => `views-line-${user.channelId}`, [user.channelId])

  const formattedUpdatedAt = useMemo(() => {
    if (!lastUpdated) {
      return "Awaiting live data"
    }

    const timestamp = new Date(lastUpdated)
    return `Last updated ${timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}`
  }, [lastUpdated])

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg sm:text-xl">Real-Time Stats</CardTitle>
          <CardDescription>
            Live views per hour, engagement rate, and watch time across your most recent uploads.
          </CardDescription>
        </div>
        <Badge variant="secondary" className="self-start sm:self-auto">
          {formattedUpdatedAt}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <ChartContainer
            className="h-64"
            config={{
              views: {
                label: "Views per hour",
                color: "hsl(var(--chart-1))",
              },
            }}
          >
            {isLoading ? (
              <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
                <Spinner className="h-4 w-4" /> Refreshing live metrics…
              </div>
            ) : points.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={viewsGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" />
                      <stop offset="50%" stopColor="hsl(var(--chart-2))" />
                      <stop offset="100%" stopColor="hsl(var(--chart-3))" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value.toLocaleString()}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke={`url(#${viewsGradientId})`}
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      strokeWidth: 2,
                      fill: "var(--background)",
                      stroke: "hsl(var(--chart-2))",
                    }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--chart-3))" }}
                    strokeLinecap="round"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No recent uploads available for live tracking.
              </div>
            )}
          </ChartContainer>

          <div className="space-y-4">
            <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Views this hour (avg)</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  {metrics.viewsChange >= 0 ? "+" : ""}
                  {metrics.viewsChange.toFixed(1)}%
                </span>
              </div>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {latestPoint.views.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Avg. {metrics.averageViews.toLocaleString()} views/hr across recent uploads</p>
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/30 p-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Live engagement</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {(metrics.engagementRate || 0).toFixed(1)}%
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Likes + comments</span>
                <span>
                  {latestPoint.likes.toLocaleString()} likes · {latestPoint.comments.toLocaleString()} comments
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Change vs. prev hour</span>
                <span className={metrics.engagementChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                  {metrics.engagementChange >= 0 ? "+" : ""}
                  {metrics.engagementChange.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Estimated active viewers</span>
                <UsersRound className="h-4 w-4" />
              </div>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {latestPoint.liveViewers.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Watch time this hour: {latestPoint.watchTimeMinutes.toLocaleString()} min
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span>
          Total views (recent uploads): <strong className="text-foreground">{metrics.totalViews.toLocaleString()}</strong>
        </span>
        <span>
          Engagement (likes + comments): <strong className="text-foreground">{metrics.totalEngagement.toLocaleString()}</strong> interactions
        </span>
        <span>
          Watch time: <strong className="text-foreground">{metrics.watchTimeHours.toFixed(1)}</strong> hours
        </span>
      </CardFooter>
    </Card>
  )
}
