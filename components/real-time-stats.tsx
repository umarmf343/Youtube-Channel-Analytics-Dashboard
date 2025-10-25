"use client"

import { AlertTriangle } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function RealTimeStats() {
  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg sm:text-xl">Real-Time Stats</CardTitle>
          <Badge variant="outline" className="gap-1 text-xs">
            <AlertTriangle className="h-3.5 w-3.5" />
            Live data required
          </Badge>
        </div>
        <CardDescription>
          Live analytics are unavailable because this dashboard only surfaces authentic YouTube Analytics data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 rounded-lg border border-dashed border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
          <p>
            Connect a data source that can serve fresh Analytics API metrics to unlock real-time performance tracking. Until
            then, the dashboard will avoid showing simulated charts or placeholder growth figures.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Provide a backend endpoint that proxies the YouTube Analytics API with valid OAuth credentials.</li>
            <li>Return metrics such as views, watch time, likes, and comments in an hourly or daily breakdown.</li>
            <li>Surface descriptive errors from the API so the UI can communicate issues to the channel owner.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
