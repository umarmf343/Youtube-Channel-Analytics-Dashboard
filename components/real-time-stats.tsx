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

interface RealTimePoint {
  timestamp: string
  views: number
  likes: number
  comments: number
  watchTimeMinutes: number
  liveViewers: number
}

const DATA_POINTS = 12

const formatTimeLabel = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

const createInitialData = (): RealTimePoint[] => {
  const now = new Date()

  return Array.from({ length: DATA_POINTS }, (_, index) => {
    const pointTime = new Date(now.getTime() - (DATA_POINTS - index - 1) * 60 * 60 * 1000)
    const baseViews = 1800 + index * 120
    const views = Math.round(baseViews * (0.9 + Math.random() * 0.2))
    const likes = Math.round(views * (0.045 + Math.random() * 0.01))
    const comments = Math.round(views * (0.012 + Math.random() * 0.006))
    const averageWatchTime = 4.5 + Math.random() * 1.5

    return {
      timestamp: formatTimeLabel(pointTime),
      views,
      likes,
      comments,
      watchTimeMinutes: Math.round(views * averageWatchTime),
      liveViewers: Math.round(views * (0.03 + Math.random() * 0.015)),
    }
  })
}

export default function RealTimeStats() {
  const [data, setData] = useState<RealTimePoint[]>(() => createInitialData())
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setData((previous) => {
        const latest = previous[previous.length - 1]
        const nextViews = Math.max(1200, Math.round(latest.views * (0.94 + Math.random() * 0.16)))
        const nextLikes = Math.round(nextViews * (0.048 + Math.random() * 0.012))
        const nextComments = Math.round(nextViews * (0.013 + Math.random() * 0.006))
        const averageWatchTime = 4.3 + Math.random() * 1.7
        const nextPoint: RealTimePoint = {
          timestamp: formatTimeLabel(new Date()),
          views: nextViews,
          likes: nextLikes,
          comments: nextComments,
          watchTimeMinutes: Math.round(nextViews * averageWatchTime),
          liveViewers: Math.round(nextViews * (0.032 + Math.random() * 0.015)),
        }

        return [...previous.slice(-DATA_POINTS + 1), nextPoint]
      })
      setLastUpdated(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const latestPoint = data[data.length - 1]
  const previousPoint = data[data.length - 2]

  const metrics = useMemo(() => {
    const totalViews = data.reduce((total, point) => total + point.views, 0)
    const totalEngagement = data.reduce((total, point) => total + point.likes + point.comments, 0)
    const totalWatchTime = data.reduce((total, point) => total + point.watchTimeMinutes, 0)
    const previousEngagement = previousPoint ? previousPoint.likes + previousPoint.comments : 0

    return {
      averageViews: Math.round(totalViews / data.length),
      engagementRate: latestPoint.views
        ? ((latestPoint.likes + latestPoint.comments) / latestPoint.views) * 100
        : 0,
      engagementChange:
        previousEngagement > 0
          ? ((latestPoint.likes + latestPoint.comments - previousEngagement) / previousEngagement) * 100
          : 0,
      viewsChange:
        previousPoint && previousPoint.views
          ? ((latestPoint.views - previousPoint.views) / previousPoint.views) * 100
          : 0,
      watchTimeHours: totalWatchTime / 60,
      totalEngagement,
      totalViews,
    }
  }, [data, latestPoint, previousPoint])

  const formattedUpdatedAt = useMemo(
    () =>
      `Last updated ${lastUpdated.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}`,
    [lastUpdated],
  )

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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="space-y-4">
            <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Views this hour</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  {metrics.viewsChange >= 0 ? "+" : ""}
                  {metrics.viewsChange.toFixed(1)}%
                </span>
              </div>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {latestPoint.views.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Avg. {metrics.averageViews.toLocaleString()} views/hr today</p>
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
                <span>Live viewers</span>
                <UsersRound className="h-4 w-4" />
              </div>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {latestPoint.liveViewers.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Watch time {Math.round(latestPoint.watchTimeMinutes / 60)} hr ({latestPoint.watchTimeMinutes.toLocaleString()} min)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span>
          Total views today: <strong className="text-foreground">{metrics.totalViews.toLocaleString()}</strong>
        </span>
        <span>
          Engagement today: <strong className="text-foreground">{metrics.totalEngagement.toLocaleString()}</strong> interactions
        </span>
        <span>
          Watch time: <strong className="text-foreground">{metrics.watchTimeHours.toFixed(1)}</strong> hours
        </span>
      </CardFooter>
    </Card>
  )
}
