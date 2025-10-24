"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { mockVideos, mockKeywords, mockCompetitors } from "@/lib/mock-data"

export default function ExportDataPage() {
  const [selectedData, setSelectedData] = useState({
    videos: true,
    keywords: true,
    competitors: true,
  })

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,"

    if (selectedData.videos) {
      csvContent += "VIDEOS\n"
      csvContent += "Title,Views,Likes,Comments,SEO Score\n"
      mockVideos.forEach((video) => {
        csvContent += `"${video.title}",${video.views},${video.likes},${video.comments},${video.seoScore}\n`
      })
      csvContent += "\n"
    }

    if (selectedData.keywords) {
      csvContent += "KEYWORDS\n"
      csvContent += "Keyword,Search Volume,Competition,Trend,Score,Difficulty\n"
      mockKeywords.forEach((keyword) => {
        csvContent += `"${keyword.term}",${keyword.searchVolume},${keyword.competition},${keyword.trend},${keyword.score},${keyword.difficulty}\n`
      })
      csvContent += "\n"
    }

    if (selectedData.competitors) {
      csvContent += "COMPETITORS\n"
      csvContent += "Channel,Subscribers,Total Views,Avg Views,Growth Rate\n"
      mockCompetitors.forEach((competitor) => {
        csvContent += `"${competitor.channelName}",${competitor.subscribers},${competitor.totalViews},${competitor.avgViews},${competitor.growthRate}%\n`
      })
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `vidstream-export-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportJSON = () => {
    const exportData: any = {}

    if (selectedData.videos) exportData.videos = mockVideos
    if (selectedData.keywords) exportData.keywords = mockKeywords
    if (selectedData.competitors) exportData.competitors = mockCompetitors

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `vidstream-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Export Data</h1>
        <p className="text-muted-foreground">Download your analytics and keyword data in multiple formats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Selection */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Select Data to Export</CardTitle>
            <CardDescription>Choose what to include</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="videos"
                checked={selectedData.videos}
                onCheckedChange={(checked) => setSelectedData({ ...selectedData, videos: checked as boolean })}
              />
              <label htmlFor="videos" className="text-sm font-medium cursor-pointer">
                Videos ({mockVideos.length})
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="keywords"
                checked={selectedData.keywords}
                onCheckedChange={(checked) => setSelectedData({ ...selectedData, keywords: checked as boolean })}
              />
              <label htmlFor="keywords" className="text-sm font-medium cursor-pointer">
                Keywords ({mockKeywords.length})
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="competitors"
                checked={selectedData.competitors}
                onCheckedChange={(checked) => setSelectedData({ ...selectedData, competitors: checked as boolean })}
              />
              <label htmlFor="competitors" className="text-sm font-medium cursor-pointer">
                Competitors ({mockCompetitors.length})
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Export Formats</CardTitle>
              <CardDescription>Choose your preferred format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleExportCSV} className="w-full" size="lg">
                📊 Export as CSV
              </Button>
              <Button onClick={handleExportJSON} variant="outline" className="w-full bg-transparent" size="lg">
                📄 Export as JSON
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm">Export Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedData.videos && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Videos</p>
                  <div className="space-y-1">
                    {mockVideos.slice(0, 2).map((video) => (
                      <p key={video.id} className="text-xs text-muted-foreground truncate">
                        • {video.title}
                      </p>
                    ))}
                    {mockVideos.length > 2 && (
                      <p className="text-xs text-muted-foreground">+ {mockVideos.length - 2} more</p>
                    )}
                  </div>
                </div>
              )}
              {selectedData.keywords && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {mockKeywords.slice(0, 3).map((keyword) => (
                      <Badge key={keyword.id} variant="secondary" className="text-xs">
                        {keyword.term}
                      </Badge>
                    ))}
                    {mockKeywords.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{mockKeywords.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {selectedData.competitors && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Competitors</p>
                  <div className="space-y-1">
                    {mockCompetitors.slice(0, 2).map((competitor) => (
                      <p key={competitor.id} className="text-xs text-muted-foreground truncate">
                        • {competitor.channelName}
                      </p>
                    ))}
                    {mockCompetitors.length > 2 && (
                      <p className="text-xs text-muted-foreground">+ {mockCompetitors.length - 2} more</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
