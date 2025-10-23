"use client"

import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  mockAudienceSegments,
  mockChannelSnapshot,
  mockForecast,
  mockTagPerformance,
  mockVideoLibrary,
} from "@/lib/mock-data"
import { formatNumber } from "@/lib/utils"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

export default function ChannelCommandCenter() {
  const [searchTerm, setSearchTerm] = useState("")
  const [tagFilter, setTagFilter] = useState("all")

  const availableTags = useMemo(() => {
    return [
      "all",
      ...Array.from(new Set(mockVideoLibrary.flatMap((video) => video.tags))).sort((a, b) => a.localeCompare(b)),
    ]
  }, [])

  const filteredVideos = useMemo(() => {
    return mockVideoLibrary.filter((video) => {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTag = tagFilter === "all" || video.tags.includes(tagFilter)
      return matchesSearch && matchesTag
    })
  }, [searchTerm, tagFilter])

  const velocityLeaders = useMemo(() => {
    return [...mockVideoLibrary]
      .sort((a, b) => b.seoScore + b.views / 1000 - (a.seoScore + a.views / 1000))
      .slice(0, 3)
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-foreground">Channel Command Center</h2>
        <p className="text-muted-foreground">
          Blend Streamlit-style channel intelligence with VidIStream&apos;s real-time dashboard to steer every growth lever from
          one place.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-border/60">
          <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{mockChannelSnapshot.title}</CardTitle>
              <CardDescription>{mockChannelSnapshot.description}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              {mockChannelSnapshot.bestUploadTimes.map((slot) => (
                <Badge key={slot} variant="outline" className="bg-primary/5">
                  ⏱️ {slot}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Subscribers", value: formatNumber(mockChannelSnapshot.subscribers) },
                { label: "Total Views", value: formatNumber(mockChannelSnapshot.totalViews) },
                { label: "Videos", value: mockChannelSnapshot.totalVideos.toLocaleString() },
                { label: "Engagement", value: `${mockChannelSnapshot.engagementRate}%` },
              ].map((metric) => (
                <div key={metric.label} className="p-4 rounded-lg border border-border/60 bg-muted/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{metric.label}</p>
                  <p className="text-lg font-semibold text-foreground">{metric.value}</p>
                </div>
              ))}
            </div>

            <Separator className="bg-border/60" />

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Top Audience Locations</p>
              <div className="flex flex-wrap gap-2">
                {mockChannelSnapshot.topLocations.map((location) => (
                  <Badge key={location} variant="secondary" className="bg-secondary/30">
                    📍 {location}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Audience Segments</CardTitle>
            <CardDescription>Prime viewing windows extracted from historical watch-time data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAudienceSegments.map((segment) => (
              <div key={segment.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium text-foreground">{segment.name}</div>
                  <div className="text-muted-foreground">{segment.percentage}%</div>
                </div>
                <Progress value={segment.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">Prime Time: {segment.primeTime}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-border/60">
          <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle>Video Intelligence</CardTitle>
              <CardDescription>Search, segment, and surface opportunities across your library</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="bg-input"
              />
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  {availableTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag === "all" ? "All tags" : tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>SEO Score</TableHead>
                  <TableHead>Last Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVideos.slice(0, 6).map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="max-w-[220px]">
                      <p className="font-medium text-foreground truncate">{video.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Published {video.uploadDate.toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>{formatNumber(video.views)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {video.seoScore}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                      {video.tags.slice(0, 3).join(", ")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        Open Playbook
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground">
              Showing {Math.min(filteredVideos.length, 6)} of {filteredVideos.length} matched videos
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Forecast & Goals</CardTitle>
            <CardDescription>Prophet-inspired growth curves across views, subs, and RPM</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={mockForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" tickFormatter={(value) => formatNumber(value)} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                  formatter={(value: number, name: string) => {
                    if (name === "revenueProjection") {
                      return [`$${value.toLocaleString()}`, "Revenue"]
                    }
                    if (name === "predictedSubscribers") {
                      return [formatNumber(value), "Subscribers"]
                    }
                    return [formatNumber(value), "Views"]
                  }}
                />
                <Line type="monotone" dataKey="predictedViews" stroke="var(--color-chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="predictedSubscribers" stroke="var(--color-chart-2)" strokeWidth={2} />
                <Line type="monotone" dataKey="revenueProjection" stroke="var(--color-chart-3)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next milestone</span>
                <span className="font-semibold text-foreground">250K subscribers in 19 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Projected monthly RPM</span>
                <span className="font-semibold text-foreground">$820 (+14%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="border-border/60 xl:col-span-2">
          <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle>Tag Performance Matrix</CardTitle>
              <CardDescription>Identify which metadata combos from the legacy dashboard still drive velocity</CardDescription>
            </div>
            <Button variant="outline">Export CSV</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Avg Views</TableHead>
                  <TableHead>Retention</TableHead>
                  <TableHead>Videos</TableHead>
                  <TableHead>Last Used</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTagPerformance.map((tag) => (
                  <TableRow key={tag.tag}>
                    <TableCell className="font-medium text-foreground">#{tag.tag}</TableCell>
                    <TableCell>{formatNumber(tag.avgViews)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={tag.retention} className="h-2 w-28" />
                        <span className="text-xs text-muted-foreground">{tag.retention}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{tag.videosUsed}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{tag.lastUsed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Momentum Radar</CardTitle>
            <CardDescription>Borrowed from the Streamlit growth board to spotlight what&apos;s surging</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {velocityLeaders.map((video) => (
              <div key={video.id} className="p-4 rounded-lg bg-muted/30 border border-border/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{video.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(video.views)} views · SEO Score {video.seoScore}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
                    ↑ Growth Burst
                  </Badge>
                </div>
                <Separator className="my-3 bg-border/60" />
                <p className="text-xs text-muted-foreground">
                  Recommendation: Refresh end screens and promote during {mockChannelSnapshot.bestUploadTimes[0]} slot.
                </p>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              Launch Optimization Workflow
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

