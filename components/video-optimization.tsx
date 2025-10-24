"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { mockVideos } from "@/lib/mock-data"

export default function VideoOptimization() {
  const [selectedVideo, setSelectedVideo] = useState(mockVideos[0])
  const [editMode, setEditMode] = useState(false)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Video Optimization Suite</h2>
        <p className="text-muted-foreground">Optimize your videos for maximum reach and engagement</p>
      </div>

      <Tabs defaultValue="manager" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted">
          <TabsTrigger value="manager">Manager</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="thumbnail">Thumbnail</TabsTrigger>
          <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
        </TabsList>

        {/* Video Manager */}
        <TabsContent value="manager" className="space-y-6">
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
                  <p className="font-medium truncate text-sm">{video.title}</p>
                  <p
                    className={`text-xs ${selectedVideo.id === video.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                  >
                    {video.views.toLocaleString()} views
                  </p>
                </button>
              ))}
            </div>

            {/* Video Editor */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Edit Video Metadata</CardTitle>
                    <CardDescription>Bulk edit titles, descriptions, and tags</CardDescription>
                  </div>
                  <Button onClick={() => setEditMode(!editMode)} variant={editMode ? "default" : "outline"}>
                    {editMode ? "Save" : "Edit"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                    <Input value={selectedVideo.title} disabled={!editMode} className="bg-input" />
                    <p className="text-xs text-muted-foreground mt-1">{selectedVideo.title.length}/100 characters</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                    <Textarea value={selectedVideo.description} disabled={!editMode} className="bg-input min-h-32" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedVideo.description.length}/5000 characters
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50">
                      {selectedVideo.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {editMode && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        Changes will be applied to this video. You can also apply these changes to multiple videos at
                        once.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SEO Score */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>SEO Scorecard</CardTitle>
                  <CardDescription>Video optimization metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { category: "Title Optimization", score: 92 },
                    { category: "Description Quality", score: 88 },
                    { category: "Tags Relevance", score: 85 },
                    { category: "Thumbnail Appeal", score: 90 },
                    { category: "Overall SEO", score: selectedVideo.seoScore },
                  ].map((item) => (
                    <div key={item.category}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{item.category}</span>
                        <span className="text-sm font-bold text-foreground">{item.score}/100</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.score >= 85 ? "bg-green-600" : item.score >= 75 ? "bg-yellow-600" : "bg-red-600"}`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tags Copy Tool */}
        <TabsContent value="tags" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Video Tags Copy Tool</CardTitle>
              <CardDescription>Copy tags from other videos to enhance your metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Source Video */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Source Video</h3>
                  <div className="space-y-2">
                    {mockVideos.map((video) => (
                      <button
                        key={video.id}
                        className="w-full text-left p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <p className="font-medium text-sm text-foreground">{video.title}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {video.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Video */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Apply Tags To</h3>
                  <div className="space-y-2">
                    {mockVideos.map((video) => (
                      <button
                        key={video.id}
                        className="w-full text-left p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <p className="font-medium text-sm text-foreground">{video.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{video.tags.length} tags</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comment Templates */}
        <TabsContent value="comments" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Comment Templates</CardTitle>
              <CardDescription>Save and reuse responses to common viewer comments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    trigger: "How do I get started?",
                    response:
                      "Great question! Check out our beginner's guide in the description. Feel free to ask if you have more questions!",
                  },
                  {
                    trigger: "Can you make a video about X?",
                    response:
                      "Thanks for the suggestion! I'll add it to my content roadmap. Subscribe to stay updated!",
                  },
                  {
                    trigger: "This helped me so much!",
                    response:
                      "I'm so glad this was helpful! Don't forget to like and subscribe for more content like this.",
                  },
                  {
                    trigger: "Where can I find the code?",
                    response:
                      "The code is available in the GitHub link in the description. Let me know if you have any issues!",
                  },
                ].map((template, idx) => (
                  <Card key={idx} className="border-border/50 bg-muted/30">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium text-foreground mb-2">Trigger: {template.trigger}</p>
                      <p className="text-sm text-muted-foreground mb-3">{template.response}</p>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Thumbnail Preview */}
        <TabsContent value="thumbnail" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Thumbnail Preview Tool</CardTitle>
              <CardDescription>Preview your thumbnail across different devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { device: "Desktop", width: 320, height: 180 },
                  { device: "Mobile", width: 168, height: 94 },
                  { device: "YouTube Search", width: 120, height: 90 },
                ].map((preview) => (
                  <div key={preview.device}>
                    <p className="text-sm font-medium text-foreground mb-3">{preview.device}</p>
                    <div
                      className="bg-muted rounded-lg flex items-center justify-center text-muted-foreground"
                      style={{ width: preview.width, height: preview.height }}
                    >
                      📹
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  Tip: Use high contrast colors and large text to make your thumbnail stand out in search results and
                  recommendations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Best Time to Post */}
        <TabsContent value="scheduler" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Best Time to Post Scheduler</CardTitle>
              <CardDescription>Schedule your videos for optimal viewer engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Heatmap */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Audience Activity Heatmap</h3>
                  <div className="space-y-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <div key={day}>
                        <p className="text-sm text-foreground mb-1">{day}</p>
                        <div className="flex gap-1">
                          {Array.from({ length: 24 }).map((_, hour) => (
                            <div
                              key={hour}
                              className="flex-1 h-6 rounded bg-muted hover:bg-primary/50 transition-colors"
                              title={`${hour}:00`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Recommended Upload Times</h3>
                  <div className="space-y-3">
                    {[
                      { time: "Tuesday 2:00 PM", engagement: "92%" },
                      { time: "Thursday 10:00 AM", engagement: "88%" },
                      { time: "Saturday 6:00 PM", engagement: "85%" },
                      { time: "Wednesday 3:00 PM", engagement: "82%" },
                    ].map((rec) => (
                      <div key={rec.time} className="p-3 rounded-lg bg-muted/50 flex justify-between items-center">
                        <span className="font-medium text-foreground">{rec.time}</span>
                        <span className="text-sm font-bold text-green-600">{rec.engagement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button className="w-full">Schedule Video</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
