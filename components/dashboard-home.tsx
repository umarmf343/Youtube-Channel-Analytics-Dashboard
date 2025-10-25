"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { User, Video } from "@/lib/types"
import { fetchChannelVideos } from "@/lib/youtube-api"
import { Spinner } from "@/components/ui/spinner"
import RealTimeStats from "@/components/real-time-stats"
import { generateDailyVideoIdeas } from "@/lib/daily-ideas"

interface DashboardHomeProps {
  user: User
}

export default function DashboardHome({ user }: DashboardHomeProps) {
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
          const message = err instanceof Error ? err.message : "Unable to load videos"
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

  const metrics = useMemo(() => {
    if (!videos.length) {
      return {
        totalVideos: 0,
        averageViews: 0,
        averageLikes: 0,
        averageComments: 0,
      }
    }

    const totals = videos.reduce(
      (acc, video) => {
        acc.views += video.views
        acc.likes += video.likes
        acc.comments += video.comments
        return acc
      },
      { views: 0, likes: 0, comments: 0 },
    )

    return {
      totalVideos: videos.length,
      averageViews: Math.round(totals.views / videos.length),
      averageLikes: Math.round(totals.likes / videos.length),
      averageComments: Math.round(totals.comments / videos.length),
    }
  }, [videos])

  const dailyIdeas = useMemo(() => generateDailyVideoIdeas(user, videos), [user, videos])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">Review live performance metrics for {user.channelName}.</p>
        </div>
        {user.thumbnail ? (
          <img src={user.thumbnail} alt={user.channelName} className="h-16 w-16 rounded-full border border-border" />
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardHeader>
            <CardDescription>Subscribers</CardDescription>
            <CardTitle className="text-2xl">{user.subscribers.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader>
            <CardDescription>Total views</CardDescription>
            <CardTitle className="text-2xl">{user.totalViews.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader>
            <CardDescription>Published videos</CardDescription>
            <CardTitle className="text-2xl">{metrics.totalVideos}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader>
            <CardDescription>Avg. views per video</CardDescription>
            <CardTitle className="text-2xl">{metrics.averageViews.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <RealTimeStats />

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>AI Daily Video Ideas</CardTitle>
          <CardDescription>Personalized prompts based on audience momentum and engagement.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Spinner className="h-4 w-4" /> Generating ideas…
            </div>
          ) : dailyIdeas.length === 0 ? (
            <p className="text-muted-foreground">Not enough signals yet—upload a video to unlock daily ideas.</p>
          ) : (
            <div className="space-y-4">
              {error ? (
                <p className="text-xs text-muted-foreground">
                  Live channel data is unavailable right now—serving fresh suggestions from recent performance.
                </p>
              ) : null}
              {dailyIdeas.map((idea) => {
                const confidenceStyles =
                  idea.confidence === "High"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    : idea.confidence === "Medium"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                      : "bg-sky-500/10 text-sky-500 border-sky-500/30"

                return (
                  <div key={idea.id} className="space-y-3 rounded-lg border border-border/40 bg-muted/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={confidenceStyles}>
                          {idea.confidence} confidence
                        </Badge>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Score {idea.score}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Projected views {" "}
                        <span className="font-medium text-foreground">{idea.projectedViews.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-foreground">{idea.title}</h3>
                      <p className="text-sm text-muted-foreground">{idea.summary}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                      <Badge variant="outline" className="text-xs font-medium uppercase tracking-wide">
                        {idea.focusKeyword}
                      </Badge>
                      <span>+{idea.engagementBoost}% engagement lift</span>
                      <span>{idea.recommendedUploadTime}</span>
                      {idea.trendSignal ? <span>{idea.trendSignal}</span> : null}
                    </div>

                    {idea.inspiration ? (
                      <p className="text-xs text-muted-foreground">
                        Inspired by <span className="font-medium text-foreground">“{idea.inspiration}”</span>
                        {typeof idea.performanceLift === "number"
                          ? idea.performanceLift >= 0
                            ? ` (+${idea.performanceLift}% vs avg views)`
                            : ` (${idea.performanceLift}% vs avg views)`
                          : null}
                      </p>
                    ) : null}

                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {idea.supportingPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent uploads</CardTitle>
          <CardDescription>Sorted by view count</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Spinner className="h-4 w-4" /> Loading videos…
            </div>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : videos.length === 0 ? (
            <p className="text-muted-foreground">No videos found for this channel yet.</p>
          ) : (
            <div className="space-y-3">
              {videos
                .slice()
                .sort((a, b) => b.views - a.views)
                .slice(0, 10)
                .map((video) => (
                  <div key={video.id} className="flex items-start gap-4 rounded-lg border border-border/40 p-3">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt="" className="h-16 w-28 rounded object-cover" />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{video.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(video.uploadDate).toLocaleDateString()} • {video.views.toLocaleString()} views
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{video.likes.toLocaleString()} likes</p>
                      <p>{video.comments.toLocaleString()} comments</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
