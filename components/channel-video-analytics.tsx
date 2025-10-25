"use client"

import { useEffect, useMemo, useState } from "react"

import BulkDescriptionEditor from "@/components/bulk-description-editor"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import type { User, Video } from "@/lib/types"
import { fetchChannelVideos } from "@/lib/youtube-api"

interface ChannelVideoAnalyticsProps {
  user: User
}

type VideoAnalytics = Video & {
  viewsPerHour: number
  estimatedWatchTimeMinutes: number
  engagementRate: number
  watchTimeHours: number
}

export default function ChannelVideoAnalytics({ user }: ChannelVideoAnalyticsProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadVideos = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchChannelVideos(user.channelId)
        if (isMounted) {
          setVideos(data)
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Unable to load analytics"
          setError(message)
          setVideos([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadVideos()

    return () => {
      isMounted = false
    }
  }, [user.channelId])

  const analytics = useMemo<VideoAnalytics[]>(() => {
    if (!videos.length) {
      return []
    }

    const now = Date.now()

    return videos.map((video) => {
      const hoursSinceUpload = Math.max((now - new Date(video.uploadDate).getTime()) / (1000 * 60 * 60), 1 / 60)
      const viewsPerHour = video.views / hoursSinceUpload
      const engagementRate = ((video.likes + video.comments) / Math.max(video.views, 1)) * 100
      const positiveFeedbackRatio = (video.likes + video.comments * 2) / Math.max(video.views, 1)
      const retentionEstimate = Math.min(0.92, Math.max(0.35, positiveFeedbackRatio * 4 + 0.35))
      const estimatedWatchTimeMinutes = (video.duration / 60) * retentionEstimate
      const watchTimeHours = (video.views * estimatedWatchTimeMinutes) / 60

      return {
        ...video,
        viewsPerHour,
        engagementRate,
        estimatedWatchTimeMinutes,
        watchTimeHours,
      }
    })
  }, [videos])

  const summary = useMemo(() => {
    if (!analytics.length) {
      return {
        averageViewsPerHour: 0,
        averageWatchTime: 0,
        averageEngagementRate: 0,
        totalWatchTimeHours: 0,
      }
    }

    const totals = analytics.reduce(
      (acc, video) => {
        acc.viewsPerHour += video.viewsPerHour
        acc.watchTimeMinutes += video.estimatedWatchTimeMinutes
        acc.engagementRate += video.engagementRate
        acc.watchTimeHours += video.watchTimeHours
        return acc
      },
      { viewsPerHour: 0, watchTimeMinutes: 0, engagementRate: 0, watchTimeHours: 0 },
    )

    return {
      averageViewsPerHour: totals.viewsPerHour / analytics.length,
      averageWatchTime: totals.watchTimeMinutes / analytics.length,
      averageEngagementRate: totals.engagementRate / analytics.length,
      totalWatchTimeHours: totals.watchTimeHours,
    }
  }, [analytics])

  const auditInsights = useMemo(() => {
    if (!analytics.length) {
      return []
    }

    const sortedByVph = analytics.slice().sort((a, b) => b.viewsPerHour - a.viewsPerHour)
    const sortedByEngagement = analytics.slice().sort((a, b) => b.engagementRate - a.engagementRate)
    const lowRetention = analytics
      .filter((video) => video.estimatedWatchTimeMinutes / Math.max(video.duration / 60, 1 / 60) < 0.5)
      .sort((a, b) => a.estimatedWatchTimeMinutes - b.estimatedWatchTimeMinutes)

    const topVph = sortedByVph[0]
    const topEngagement = sortedByEngagement[0]

    const insights = [
      {
        title: "Top performer",
        description: `${topVph?.title ?? ""} is averaging ${Math.round(topVph?.viewsPerHour ?? 0).toLocaleString()} views/hour. Double down on its topic to sustain momentum.`,
        status: "positive" as const,
      },
      {
        title: "High engagement",
        description: `${topEngagement?.title ?? ""} drives a ${(topEngagement?.engagementRate ?? 0).toFixed(1)}% engagement rate. Replicate its hooks and calls-to-action.`,
        status: "positive" as const,
      },
    ]

    if (lowRetention.length) {
      const underperformer = lowRetention[0]
      insights.push({
        title: "Retention opportunity",
        description: `${underperformer.title} loses viewers early. Consider tighter pacing in the first 30 seconds.`,
        status: "warning" as const,
      })
    }

    return insights
  }, [analytics])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Channel & Video Analytics</h1>
        <p className="text-muted-foreground">
          Track views per hour, watch time, and engagement to pinpoint what resonates with your audience.
        </p>
      </div>

      {isLoading ? (
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-2 py-10 text-muted-foreground">
            <Spinner className="h-4 w-4" />
            Loading analytics…
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-border/50">
          <CardContent className="py-10">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : !analytics.length ? (
        <Card className="border-border/50">
          <CardContent className="py-10">
            <p className="text-muted-foreground">We could not find any videos for this channel yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardDescription>Average views per hour</CardDescription>
                <CardTitle className="text-2xl">
                  {Math.round(summary.averageViewsPerHour).toLocaleString()} VPH
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border/50">
              <CardHeader>
                <CardDescription>Average watch time</CardDescription>
                <CardTitle className="text-2xl">{summary.averageWatchTime.toFixed(1)} minutes</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border/50">
              <CardHeader>
                <CardDescription>Average engagement rate</CardDescription>
                <CardTitle className="text-2xl">{summary.averageEngagementRate.toFixed(1)}%</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border/50">
              <CardHeader>
                <CardDescription>Lifetime watch time generated</CardDescription>
                <CardTitle className="text-2xl">{Math.round(summary.totalWatchTimeHours).toLocaleString()} hours</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Video performance breakdown</CardTitle>
              <CardDescription>Views per hour, watch time, and engagement at a glance</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Video</TableHead>
                    <TableHead className="text-right">Views/hour</TableHead>
                    <TableHead className="text-right">Watch time</TableHead>
                    <TableHead className="text-right">Engagement</TableHead>
                    <TableHead className="text-right">Total views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics
                    .slice()
                    .sort((a, b) => b.viewsPerHour - a.viewsPerHour)
                    .map((video) => (
                      <TableRow key={video.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground line-clamp-2">{video.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Published {new Date(video.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {Math.round(video.viewsPerHour).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{video.estimatedWatchTimeMinutes.toFixed(1)} min</TableCell>
                        <TableCell className="text-right">{video.engagementRate.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">{video.views.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Channel audit</CardTitle>
                <CardDescription>Key insights and recommended next steps</CardDescription>
              </div>
              <Badge variant="secondary" className="uppercase tracking-wide">
                Snapshot
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {auditInsights.map((insight) => (
                <div
                  key={insight.title}
                  className="flex flex-col gap-2 rounded-lg border border-border/40 p-4 md:flex-row md:items-start md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-foreground">{insight.title}</p>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                  <Badge
                    className={
                      insight.status === "positive"
                        ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200"
                        : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200"
                    }
                  >
                    {insight.status === "positive" ? "Actionable win" : "Needs focus"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <BulkDescriptionEditor videos={videos} channelName={user.channelName} />
        </>
      )}
    </div>
  )
}
