"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { mockVideos, mockUser } from "@/lib/mock-data"
import {
  generateOptimizationReport,
  calculateChannelHealthScore,
  predictBestUploadTimes,
} from "@/lib/optimization-engine"

export default function AdvancedAnalytics() {
  const healthScore = calculateChannelHealthScore(mockVideos, mockUser.subscribers, mockUser.totalViews)
  const bestUploadTimes = predictBestUploadTimes()
  const optimizationReports = mockVideos.map((video) => generateOptimizationReport(video, []))

  const getStatusColor = (status: string) => {
    if (status === "excellent") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
    if (status === "good") return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
    if (status === "fair") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Advanced Analytics</h1>
        <p className="text-muted-foreground">
          Deep insights into your channel performance and optimization opportunities
        </p>
      </div>

      {/* Channel Health */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle>Channel Health Score</CardTitle>
          <CardDescription>Overall channel performance assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-foreground">{healthScore.score}</p>
              <p className="text-sm text-muted-foreground">out of 100</p>
            </div>
            <Badge className={getStatusColor(healthScore.status)}>{healthScore.status}</Badge>
          </div>
          <Progress value={healthScore.score} className="h-3" />
        </CardContent>
      </Card>

      {/* Best Upload Times */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recommended Upload Times</CardTitle>
          <CardDescription>Based on your audience activity patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {bestUploadTimes.map((time) => (
              <div key={time} className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="font-semibold text-foreground">{time}</p>
                <p className="text-xs text-muted-foreground mt-1">Peak engagement</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Optimization Reports */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Video Optimization Reports</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {optimizationReports.map((report) => {
            const video = mockVideos.find((v) => v.id === report.videoId)
            return (
              <Card key={report.videoId} className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg truncate">{video?.title}</CardTitle>
                  <CardDescription>Optimization score: {report.overallScore}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Overall Score</span>
                      <span className="text-sm font-bold text-foreground">{report.overallScore}%</span>
                    </div>
                    <Progress value={report.overallScore} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Top Recommendations:</p>
                    {report.recommendations.slice(0, 2).map((rec, idx) => (
                      <div key={idx} className="p-2 rounded bg-muted/50">
                        <p className="text-xs font-medium text-foreground">{rec.suggestion}</p>
                        <p className="text-xs text-muted-foreground mt-1">Impact: +{rec.impact}%</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Views</p>
                      <p className="text-sm font-bold text-foreground">+{report.estimatedImpact.viewsIncrease}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Engagement</p>
                      <p className="text-sm font-bold text-foreground">+{report.estimatedImpact.engagementIncrease}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">CTR</p>
                      <p className="text-sm font-bold text-foreground">+{report.estimatedImpact.ctrIncrease}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
