"use client"

import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  mockAutomationWorkflows,
  mockCommentInsights,
  mockScheduledPosts,
  mockTrendAlerts,
} from "@/lib/mock-data"
import { formatNumber } from "@/lib/utils"
import { predictBestUploadTimes } from "@/lib/optimization-engine"

const statusColors: Record<string, string> = {
  Scheduled: "bg-primary/10 text-primary",
  Draft: "bg-muted text-muted-foreground",
  Queued: "bg-amber-500/10 text-amber-600",
}

export default function AutomationHub() {
  const [autopilotEnabled, setAutopilotEnabled] = useState(true)
  const [autoReplies, setAutoReplies] = useState(true)

  const nextUploadWindows = useMemo(() => predictBestUploadTimes().slice(0, 3), [])

  const workflowStats = useMemo(() => {
    const active = mockAutomationWorkflows.filter((workflow) => workflow.status === "Active")
    const avgUplift = Math.round(active.reduce((sum, workflow) => sum + workflow.uplift, 0) / Math.max(active.length, 1))
    return {
      activeCount: active.length,
      avgUplift,
      tasksCompleted: mockAutomationWorkflows.reduce((sum, workflow) => sum + workflow.tasksCompleted, 0),
    }
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-foreground">Automation Hub</h2>
        <p className="text-muted-foreground">
          Originally scattered across Streamlit spreadsheets and cron scripts—now centralised. Orchestrate publishing,
          community replies, and cross-platform boosts from one cockpit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Publishing Queue</CardTitle>
              <CardDescription>Imported from the Streamlit scheduler and upgraded with VidIStream metadata.</CardDescription>
            </div>
            <Button variant="outline">Optimize schedule</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Scheduled For</TableHead>
                  <TableHead>Best Time Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Focus Keyword</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockScheduledPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium text-foreground">{post.title}</TableCell>
                    <TableCell>{post.platform}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{post.scheduledFor}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {post.bestTimeScore}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[post.status] ?? "bg-muted"}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{post.focusKeyword}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground">Auto-syncing with Google Calendar + YouTube Studio API (mocked).</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Autopilot Toggles</CardTitle>
            <CardDescription>Flip on automation flows inspired by the original Python utilities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Channel autopilot</p>
                <p className="text-xs text-muted-foreground">Schedules uploads + community boosts based on forecast.</p>
              </div>
              <Switch checked={autopilotEnabled} onCheckedChange={setAutopilotEnabled} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Smart reply concierge</p>
                <p className="text-xs text-muted-foreground">Queue AI-generated replies for high-impact threads.</p>
              </div>
              <Switch checked={autoReplies} onCheckedChange={setAutoReplies} />
            </div>
            <Separator className="bg-border/60" />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Next upload windows</p>
              <div className="flex flex-wrap gap-2">
                {nextUploadWindows.map((window) => (
                  <Badge key={window} variant="outline" className="bg-secondary/20 text-secondary-foreground">
                    ⏰ {window}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Active workflows</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-lg border border-border/60 bg-muted/10">
                  <p className="text-xs text-muted-foreground">Live</p>
                  <p className="text-lg font-semibold text-foreground">{workflowStats.activeCount}</p>
                </div>
                <div className="p-3 rounded-lg border border-border/60 bg-muted/10">
                  <p className="text-xs text-muted-foreground">Avg uplift</p>
                  <p className="text-lg font-semibold text-foreground">{workflowStats.avgUplift}%</p>
                </div>
                <div className="p-3 rounded-lg border border-border/60 bg-muted/10">
                  <p className="text-xs text-muted-foreground">Tasks done</p>
                  <p className="text-lg font-semibold text-foreground">{workflowStats.tasksCompleted}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Comment Intelligence</CardTitle>
            <CardDescription>Network analysis inspired by the analyse_comments script.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockCommentInsights.map((insight) => (
              <div key={insight.id} className="p-3 rounded-lg border border-border/60 bg-muted/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{insight.author}</p>
                    <p className="text-xs text-muted-foreground">{insight.sentiment} · {insight.replies} replies</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    Network {Math.round(insight.networkScore * 100)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">“{insight.highlight}”</p>
                <div className="mt-2">
                  <Progress value={insight.influence} className="h-2" />
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Export priority replies
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Workflow Control</CardTitle>
              <CardDescription>Toggle and inspect automation stacks migrated from the short-video-maker backend.</CardDescription>
            </div>
            <Button>Launch new workflow</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAutomationWorkflows.map((workflow) => (
              <div key={workflow.id} className="p-4 rounded-lg border border-border/60 bg-muted/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{workflow.name}</p>
                    <p className="text-xs text-muted-foreground">{workflow.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={workflow.status === "Active" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted"}>
                      {workflow.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground">Last run {workflow.lastRun}</p>
                  </div>
                </div>
                <Separator className="my-3 bg-border/60" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                  <div>
                    <p className="uppercase">Projected uplift</p>
                    <p className="text-sm font-semibold text-foreground">{workflow.uplift}%</p>
                  </div>
                  <div>
                    <p className="uppercase">Tasks completed</p>
                    <p className="text-sm font-semibold text-foreground">{workflow.tasksCompleted}</p>
                  </div>
                  <div>
                    <p className="uppercase">Next sync</p>
                    <p className="text-sm font-semibold text-foreground">{nextUploadWindows[0]}</p>
                  </div>
                  <div>
                    <p className="uppercase">Share</p>
                    <p className="text-sm font-semibold text-foreground">{formatNumber(3400)} reach</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Trend Alerts → Automations</CardTitle>
          <CardDescription>Pull trending opportunities straight into your automation recipes.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockTrendAlerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-2">
              <p className="text-sm font-semibold text-foreground">{alert.keyword}</p>
              <p className="text-xs text-muted-foreground">Trend score {alert.trend}</p>
              <p className="text-xs text-muted-foreground">Category: {alert.category}</p>
              <Button size="sm" variant="outline">
                Attach to workflow
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

