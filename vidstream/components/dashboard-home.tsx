"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { User } from "@/lib/types"
import { mockAnalytics, mockVideos } from "@/lib/mock-data"
import { calculateChannelHealthScore } from "@/lib/optimization-engine"

interface DashboardHomeProps {
  user: User
}

const chartData = [
  { date: "Oct 15", views: 12500, watchTime: 45000, subscribers: 244800 },
  { date: "Oct 16", views: 14200, watchTime: 52000, subscribers: 244950 },
  { date: "Oct 17", views: 11800, watchTime: 43000, subscribers: 245100 },
  { date: "Oct 18", views: 16500, watchTime: 61000, subscribers: 245280 },
  { date: "Oct 19", views: 13200, watchTime: 48000, subscribers: 245400 },
  { date: "Oct 20", views: 18900, watchTime: 68000, subscribers: 245600 },
  { date: "Oct 21", views: 15600, watchTime: 55000, subscribers: 245800 },
]

export default function DashboardHome({ user }: DashboardHomeProps) {
  const healthScore = calculateChannelHealthScore(mockVideos, user.subscribers, user.totalViews)

  const getHealthColor = (status: string) => {
    if (status === "excellent") return "text-green-600 dark:text-green-400"
    if (status === "good") return "text-blue-600 dark:text-blue-400"
    if (status === "fair") return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user.name}!</h2>
        <p className="text-muted-foreground">Here's your channel performance overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Views", value: mockAnalytics.views.toLocaleString(), change: "+12.5%" },
          {
            label: "Watch Time (hrs)",
            value: (mockAnalytics.watchTime / 3600).toLocaleString(undefined, { maximumFractionDigits: 0 }),
            change: "+8.2%",
          },
          { label: "Subscribers", value: mockAnalytics.subscribers.toLocaleString(), change: "+2.1%" },
          { label: "Engagement Rate", value: `${mockAnalytics.engagement}%`, change: "+1.3%" },
          {
            label: "Channel Health",
            value: healthScore.score,
            change: healthScore.status,
            isHealth: true,
          },
        ].map((metric) => (
          <Card key={metric.label} className="border-border/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-foreground mb-2">{metric.value}</p>
              <p className={`text-xs ${metric.isHealth ? getHealthColor(metric.change as string) : "text-green-600"}`}>
                {metric.isHealth ? `Status: ${metric.change}` : `${metric.change} this week`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views & Watch Time */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Views & Watch Time</CardTitle>
            <CardDescription>Last 7 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="var(--color-chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="watchTime" stroke="var(--color-chart-2)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscriber Growth */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Subscriber Growth</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
                <Bar dataKey="subscribers" fill="var(--color-chart-3)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Videos */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Top Performing Videos</CardTitle>
          <CardDescription>Your best videos this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockVideos.map((video) => (
              <div
                key={video.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="w-24 h-16 rounded bg-muted flex-shrink-0 flex items-center justify-center text-muted-foreground">
                  📹
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{video.title}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{video.views.toLocaleString()} views</span>
                    <span>{video.likes.toLocaleString()} likes</span>
                    <span>{video.comments.toLocaleString()} comments</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-foreground">{video.seoScore}</div>
                  <div className="text-xs text-muted-foreground">SEO Score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button className="h-auto py-4 bg-transparent" variant="outline">
          <div className="text-center">
            <p className="text-lg mb-1">🔍</p>
            <p className="font-semibold">Research Keywords</p>
            <p className="text-xs text-muted-foreground">Find trending topics</p>
          </div>
        </Button>
        <Button className="h-auto py-4 bg-transparent" variant="outline">
          <div className="text-center">
            <p className="text-lg mb-1">📊</p>
            <p className="font-semibold">Analyze Competitors</p>
            <p className="text-xs text-muted-foreground">Track their growth</p>
          </div>
        </Button>
        <Button className="h-auto py-4 bg-transparent" variant="outline">
          <div className="text-center">
            <p className="text-lg mb-1">✨</p>
            <p className="font-semibold">Optimize Videos</p>
            <p className="text-xs text-muted-foreground">Get recommendations</p>
          </div>
        </Button>
      </div>
    </div>
  )
}
