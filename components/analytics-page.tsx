"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { mockVideos, mockAnalytics } from "@/lib/mock-data"

const analyticsData = [
  { date: "Oct 15", views: 12500, engagement: 8.2, ctr: 4.5 },
  { date: "Oct 16", views: 14200, engagement: 8.5, ctr: 4.7 },
  { date: "Oct 17", views: 11800, engagement: 7.9, ctr: 4.2 },
  { date: "Oct 18", views: 16500, engagement: 9.1, ctr: 5.1 },
  { date: "Oct 19", views: 13200, engagement: 8.3, ctr: 4.6 },
  { date: "Oct 20", views: 18900, engagement: 9.5, ctr: 5.3 },
  { date: "Oct 21", views: 15600, engagement: 8.8, ctr: 4.9 },
]

const trafficSources = [
  { name: "YouTube Search", value: 45, color: "var(--color-chart-1)" },
  { name: "Suggested Videos", value: 30, color: "var(--color-chart-2)" },
  { name: "External", value: 15, color: "var(--color-chart-3)" },
  { name: "Playlist", value: 10, color: "var(--color-chart-4)" },
]

export default function AnalyticsPage() {
  const [selectedVideo, setSelectedVideo] = useState(mockVideos[0])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Analytics & Insights</h2>
        <p className="text-muted-foreground">Monitor your channel performance with real-time stats</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="audit">Channel Audit</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Views", value: mockAnalytics.views.toLocaleString(), change: "+12.5%" },
              { label: "Engagement Rate", value: `${mockAnalytics.engagement}%`, change: "+1.3%" },
              { label: "CTR", value: `${mockAnalytics.ctr}%`, change: "+0.8%" },
              { label: "Avg Duration", value: `${mockAnalytics.avgViewDuration}m`, change: "+0.2m" },
            ].map((metric) => (
              <Card key={metric.label} className="border-border/50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground mb-2">{metric.value}</p>
                  <p className="text-xs text-green-600">{metric.change} this week</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Views & Engagement</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="var(--color-chart-1)" strokeWidth={2} />
                    <Line type="monotone" dataKey="engagement" stroke="var(--color-chart-2)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your views come from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Videos */}
        <TabsContent value="videos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video List */}
            <div className="lg:col-span-1 space-y-2">
              {mockVideos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedVideo.id === video.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <p className="font-medium truncate">{video.title}</p>
                  <p
                    className={`text-sm ${selectedVideo.id === video.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                  >
                    {video.views.toLocaleString()} views
                  </p>
                </button>
              ))}
            </div>

            {/* Video Details */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>{selectedVideo.title}</CardTitle>
                  <CardDescription>Uploaded {selectedVideo.uploadDate.toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: "Views", value: selectedVideo.views.toLocaleString() },
                      {
                        label: "Watch Time",
                        value: `${(selectedVideo.watchTime / 3600).toLocaleString(undefined, { maximumFractionDigits: 0 })}h`,
                      },
                      { label: "Likes", value: selectedVideo.likes.toLocaleString() },
                      { label: "Comments", value: selectedVideo.comments.toLocaleString() },
                      { label: "Shares", value: selectedVideo.shares.toLocaleString() },
                      { label: "SEO Score", value: selectedVideo.seoScore },
                    ].map((stat) => (
                      <div key={stat.label} className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-lg font-bold text-foreground">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Audience */}
        <TabsContent value="audience" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Audience Demographics</CardTitle>
              <CardDescription>Your typical viewer profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Age Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { age: "18-24", percentage: 35 },
                      { age: "25-34", percentage: 40 },
                      { age: "35-44", percentage: 15 },
                      { age: "45+", percentage: 10 },
                    ].map((item) => (
                      <div key={item.age}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-foreground">{item.age}</span>
                          <span className="text-sm font-medium text-foreground">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">Top Countries</h3>
                  <div className="space-y-2">
                    {[
                      { country: "United States", views: "45%" },
                      { country: "United Kingdom", views: "15%" },
                      { country: "Canada", views: "12%" },
                      { country: "Australia", views: "8%" },
                      { country: "Other", views: "20%" },
                    ].map((item) => (
                      <div key={item.country} className="flex justify-between p-2 rounded bg-muted/50">
                        <span className="text-sm text-foreground">{item.country}</span>
                        <span className="text-sm font-medium text-foreground">{item.views}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channel Audit */}
        <TabsContent value="audit" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Channel Audit Report</CardTitle>
              <CardDescription>Comprehensive review of your channel performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { category: "Channel Optimization", score: 92, status: "Excellent" },
                { category: "Content Quality", score: 88, status: "Very Good" },
                { category: "SEO Optimization", score: 85, status: "Very Good" },
                { category: "Engagement Rate", score: 78, status: "Good" },
                { category: "Upload Consistency", score: 82, status: "Very Good" },
              ].map((item) => (
                <div key={item.category} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-foreground">{item.category}</span>
                    <span
                      className={`text-sm font-bold ${item.score >= 85 ? "text-green-600" : item.score >= 75 ? "text-yellow-600" : "text-red-600"}`}
                    >
                      {item.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.score >= 85 ? "bg-green-600" : item.score >= 75 ? "bg-yellow-600" : "bg-red-600"}`}
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{item.status}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
