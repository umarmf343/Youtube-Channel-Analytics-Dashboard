"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { mockVideos } from "@/lib/mock-data"

const comparisonData = mockVideos.map((video) => ({
  title: video.title.substring(0, 15) + "...",
  views: video.views,
  likes: video.likes,
  comments: video.comments,
  watchTime: video.watchTime / 3600,
}))

export default function CompareViewsTool() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Compare Views Tool</CardTitle>
        <CardDescription>Benchmark your videos against each other to identify successful strategies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="title" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }} />
            <Legend />
            <Bar dataKey="views" fill="var(--color-chart-1)" />
            <Bar dataKey="likes" fill="var(--color-chart-2)" />
            <Bar dataKey="comments" fill="var(--color-chart-3)" />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Best Performing", value: "TypeScript Best Practices", metric: "156K views" },
            { label: "Highest Engagement", value: "TypeScript Best Practices", metric: "6.4% rate" },
            { label: "Most Comments", value: "TypeScript Best Practices", metric: "2.5K comments" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="font-semibold text-foreground">{stat.value}</p>
              <p className="text-sm text-primary mt-1">{stat.metric}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
