"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { mockCompetitors, mockTrendAlerts } from "@/lib/mock-data"

const competitorGrowthData = [
  { month: "Jan", "Web Dev Masters": 520000, "Code Academy": 380000, "JavaScript Pro": 250000 },
  { month: "Feb", "Web Dev Masters": 535000, "Code Academy": 390000, "JavaScript Pro": 265000 },
  { month: "Mar", "Web Dev Masters": 550000, "Code Academy": 405000, "JavaScript Pro": 280000 },
  { month: "Apr", "Web Dev Masters": 565000, "Code Academy": 410000, "JavaScript Pro": 295000 },
  { month: "May", "Web Dev Masters": 572000, "Code Academy": 415000, "JavaScript Pro": 310000 },
  { month: "Jun", "Web Dev Masters": 580000, "Code Academy": 420000, "JavaScript Pro": 310000 },
]

export default function CompetitorTracker() {
  const [selectedCompetitor, setSelectedCompetitor] = useState(mockCompetitors[0])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Competitor & Trend Analysis</h2>
        <p className="text-muted-foreground">Monitor competitors and track trending topics</p>
      </div>

      <Tabs defaultValue="competitors" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="trends">Trend Alerts</TabsTrigger>
          <TabsTrigger value="trending">Most Viewed</TabsTrigger>
        </TabsList>

        {/* Competitors */}
        <TabsContent value="competitors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Competitor List */}
            <div className="lg:col-span-1 space-y-2">
              {mockCompetitors.map((competitor) => (
                <button
                  key={competitor.id}
                  onClick={() => setSelectedCompetitor(competitor)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedCompetitor.id === competitor.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <p className="font-medium">{competitor.channelName}</p>
                  <p
                    className={`text-sm ${selectedCompetitor.id === competitor.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                  >
                    {competitor.subscribers.toLocaleString()} subscribers
                  </p>
                </button>
              ))}
            </div>

            {/* Competitor Details */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>{selectedCompetitor.channelName}</CardTitle>
                  <CardDescription>Competitor analysis and metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: "Subscribers", value: selectedCompetitor.subscribers.toLocaleString() },
                      { label: "Total Views", value: selectedCompetitor.totalViews.toLocaleString() },
                      { label: "Avg Views", value: selectedCompetitor.avgViews.toLocaleString() },
                      { label: "Upload Frequency", value: `${selectedCompetitor.uploadFrequency}/week` },
                      { label: "Growth Rate", value: `${selectedCompetitor.growthRate}%` },
                      { label: "Engagement", value: "8.5%" },
                    ].map((stat) => (
                      <div key={stat.label} className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-lg font-bold text-foreground">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Top Videos</h3>
                    <div className="space-y-2">
                      {selectedCompetitor.topVideos.map((video) => (
                        <div key={video.id} className="p-3 rounded-lg bg-muted/50">
                          <p className="font-medium text-foreground text-sm">{video.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{video.views.toLocaleString()} views</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Growth Comparison */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Subscriber Growth Comparison</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={competitorGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Web Dev Masters" stroke="var(--color-chart-1)" strokeWidth={2} />
                  <Line type="monotone" dataKey="Code Academy" stroke="var(--color-chart-2)" strokeWidth={2} />
                  <Line type="monotone" dataKey="JavaScript Pro" stroke="var(--color-chart-3)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trend Alerts */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Trend Alerts</CardTitle>
              <CardDescription>Set up notifications for trending topics and keywords</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockTrendAlerts.map((alert) => (
                <div key={alert.id} className="p-4 rounded-lg bg-muted/50 border-l-4 border-primary">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">{alert.keyword}</p>
                      <p className="text-sm text-muted-foreground mt-1">Category: {alert.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{alert.trend}%</p>
                      <p className="text-xs text-muted-foreground">Trend</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full bg-transparent">
                    Create Video
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Most Viewed */}
        <TabsContent value="trending" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Most Viewed Videos</CardTitle>
              <CardDescription>Trending videos across all categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rank: 1, title: "React 19 New Features", views: 2500000, category: "Web Development" },
                  { rank: 2, title: "AI in Web Development", views: 2100000, category: "AI/ML" },
                  { rank: 3, title: "Next.js 16 Tutorial", views: 1850000, category: "Web Development" },
                  { rank: 4, title: "TypeScript Advanced", views: 1620000, category: "Programming" },
                  { rank: 5, title: "Full Stack Development", views: 1450000, category: "Web Development" },
                ].map((video) => (
                  <div
                    key={video.rank}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {video.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{video.title}</p>
                      <p className="text-sm text-muted-foreground">{video.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{(video.views / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-muted-foreground">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
