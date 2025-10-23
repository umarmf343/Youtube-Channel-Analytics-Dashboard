"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
  })

  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = Math.round(endTime - startTime)

      if (renderTime > 0) {
        setMetrics((prev) => ({
          ...prev,
          renderTime,
        }))
      }
    }
  }, [])

  return (
    <Card className="border-border/50 bg-muted/30">
      <CardHeader>
        <CardTitle className="text-sm">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Render Time</span>
          <Badge variant="secondary">{metrics.renderTime}ms</Badge>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Status</span>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Optimized</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
