"use client"

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn, formatNumber } from "@/lib/utils"
import type { Video } from "@/lib/types"

interface BulkDescriptionEditorProps {
  videos: Video[]
  channelName: string
}

const DEFAULT_TEMPLATE = `🔥 New from {{channel}}: {{title}}

Here's what we cover:
{{highlights}}

🔎 SEO Keywords: {{keywords}}

👉 Stay until the end for creator-only resources.
{{cta_link}}`

const PLACEHOLDERS: Array<{ token: string; description: string }> = [
  { token: "{{title}}", description: "Video title" },
  { token: "{{channel}}", description: "Channel name" },
  { token: "{{keywords}}", description: "Top tags joined with commas" },
  { token: "{{highlights}}", description: "Auto-generated bullet list" },
  { token: "{{cta_link}}", description: "Call-to-action link" },
]

function formatTimestamp(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function generateChapterMarkers(durationSeconds: number) {
  const total = Math.max(durationSeconds, 8 * 60)
  const checkpoints = [0, total * 0.25, total * 0.55, total * 0.8]
  const labels = [
    "Intro & context",
    "Strategy breakdown",
    "Tactics in action",
    "Wrap-up & next steps",
  ]

  return labels.map((label, index) => `${formatTimestamp(checkpoints[index])} ${label}`)
}

function toHashtags(tags: string[]) {
  if (!tags.length) {
    return "#YouTubeTips #CreatorEconomy #ChannelGrowth"
  }

  return tags
    .slice(0, 5)
    .map((tag) => `#${tag.replace(/[^a-z0-9]+/gi, "").toLowerCase()}`)
    .join(" ")
}

function toHighlights(tags: string[]) {
  if (!tags.length) {
    return [
      "• Actionable takeaways that keep viewers watching",
      "• Proven tactics for consistent growth",
      "• Tools and resources you can copy",
    ].join("\n")
  }

  return tags
    .slice(0, 4)
    .map((tag) => `• ${tag.replace(/(^\w|\s\w)/g, (letter) => letter.toUpperCase())}`)
    .join("\n")
}

function formatRelativeTime(timestamp: number) {
  const delta = Date.now() - timestamp
  const minutes = Math.floor(delta / 60000)
  if (minutes <= 0) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function BulkDescriptionEditor({ videos, channelName }: BulkDescriptionEditorProps) {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [ctaLink, setCtaLink] = useState("https://youtube.com/@yourchannel?sub_confirmation=1")
  const [resourceLink, setResourceLink] = useState("https://creatorlab.example.com/playbook")
  const [includeChapters, setIncludeChapters] = useState(true)
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [includeResourceBlock, setIncludeResourceBlock] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isApplying, setIsApplying] = useState(false)
  const [updateHistory, setUpdateHistory] = useState<Record<string, { appliedAt: number; description: string }>>({})
  const [lastRun, setLastRun] = useState<{ timestamp: number; videoCount: number } | null>(null)

  const applyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      if (applyTimerRef.current) {
        clearTimeout(applyTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!videos.length) {
      setSelectedIds([])
      return
    }

    setSelectedIds((previous) => {
      const stillPresent = previous.filter((id) => videos.some((video) => video.id === id))
      if (stillPresent.length) {
        return stillPresent
      }
      return videos.slice(0, Math.min(5, videos.length)).map((video) => video.id)
    })
  }, [videos])

  const selectedVideos = useMemo(
    () => videos.filter((video) => selectedIds.includes(video.id)),
    [videos, selectedIds],
  )

  const previewVideo = selectedVideos[0] ?? videos[0]

  const buildDescription = (video: Video) => {
    const keywords = video.tags.length ? video.tags.slice(0, 8).join(", ") : "YouTube growth, creator strategy, channel analytics"
    const highlights = toHighlights(video.tags)
    const replaced = template
      .replace(/{{title}}/g, video.title)
      .replace(/{{channel}}/g, channelName)
      .replace(/{{keywords}}/g, keywords)
      .replace(/{{highlights}}/g, highlights)
      .replace(/{{cta_link}}/g, ctaLink)

    const sections: string[] = [replaced.trim()]

    if (includeChapters) {
      const chapters = generateChapterMarkers(video.duration)
      sections.push(["⏱️ Chapters", ...chapters].join("\n"))
    }

    if (includeResourceBlock) {
      sections.push(
        [
          "🔗 Useful Resources",
          `• Subscribe for more insights: ${ctaLink}`,
          `• Creator Playbook: ${resourceLink}`,
        ].join("\n"),
      )
    }

    if (includeHashtags) {
      sections.push(toHashtags(video.tags))
    }

    return sections.join("\n\n").trim()
  }

  const previewDescription = useMemo(() => {
    if (!previewVideo) return ""
    return buildDescription(previewVideo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewVideo, template, ctaLink, resourceLink, includeChapters, includeHashtags, includeResourceBlock, channelName])

  const selectAll = () => {
    setSelectedIds(videos.map((video) => video.id))
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  const toggleVideo = (videoId: string) => {
    setSelectedIds((previous) =>
      previous.includes(videoId)
        ? previous.filter((id) => id !== videoId)
        : [...previous, videoId],
    )
  }

  const handleApply = () => {
    if (!selectedVideos.length || isApplying) {
      return
    }

    setIsApplying(true)

    if (applyTimerRef.current) {
      clearTimeout(applyTimerRef.current)
    }

    const appliedAt = Date.now()

    applyTimerRef.current = setTimeout(() => {
      setUpdateHistory((previous) => {
        const next = { ...previous }
        selectedVideos.forEach((video) => {
          next[video.id] = { appliedAt, description: buildDescription(video) }
        })
        return next
      })

      setLastRun({ timestamp: appliedAt, videoCount: selectedVideos.length })

      toast({
        title: "Descriptions queued",
        description: `Template applied to ${selectedVideos.length} video${selectedVideos.length === 1 ? "" : "s"}.`,
      })

      setIsApplying(false)
      applyTimerRef.current = null
    }, 650)
  }

  const hasSelection = selectedIds.length > 0

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Bulk Description Editor</CardTitle>
            <CardDescription>
              Queue description updates across multiple uploads—mirroring VidIQ's bulk editor so SEO refreshes stay consistent.
            </CardDescription>
          </div>
          {lastRun && (
            <Badge variant="secondary" className="whitespace-nowrap self-start">
              Last run {formatRelativeTime(lastRun.timestamp)} • {lastRun.videoCount} video
              {lastRun.videoCount === 1 ? "" : "s"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
          <div className="space-y-6">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 shadow-xs">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">Select videos</p>
                  <p className="text-xs text-muted-foreground">
                    Choose the uploads that should receive the refreshed description.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAll} disabled={!videos.length}>
                    Select all
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearSelection} disabled={!hasSelection}>
                    Clear
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-60 rounded-lg border border-border/50 bg-background">
                <div className="space-y-3 p-3">
                  {videos.map((video) => {
                    const isChecked = selectedIds.includes(video.id)
                    const history = updateHistory[video.id]

                    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        toggleVideo(video.id)
                      }
                    }

                    return (
                      <div
                        key={video.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleVideo(video.id)}
                        onKeyDown={handleKeyDown}
                        className={cn(
                          "w-full rounded-lg border border-border/50 bg-background p-3 text-left transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isChecked ? "border-primary/60 shadow-sm" : "",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleVideo(video.id)}
                            onClick={(event) => event.stopPropagation()}
                          />
                          <div className="flex-1 space-y-1">
                            <p className="font-medium text-foreground line-clamp-2">{video.title}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span>{formatNumber(video.views)} views</span>
                              <span>•</span>
                              <span>{formatNumber(video.likes)} likes</span>
                              <span>•</span>
                              <span>{formatNumber(video.comments)} comments</span>
                              {history && (
                                <Badge variant="secondary" className="text-[10px] uppercase">
                                  Updated {formatRelativeTime(history.appliedAt)}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground/80 line-clamp-2">
                              {video.description ? video.description : "No existing description"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {!videos.length && (
                    <p className="text-sm text-muted-foreground/80">No videos available to edit yet.</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">Description template</p>
                  <p className="text-xs text-muted-foreground">Use tokens to personalize each update automatically.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setTemplate(DEFAULT_TEMPLATE)}>
                  Reset
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {PLACEHOLDERS.map((placeholder) => (
                  <Badge key={placeholder.token} variant="outline" className="bg-background/70">
                    <span className="font-mono text-xs">{placeholder.token}</span>
                    <span className="ml-1 text-[11px] text-muted-foreground/80">{placeholder.description}</span>
                  </Badge>
                ))}
              </div>
              <Textarea
                value={template}
                onChange={(event) => setTemplate(event.target.value)}
                rows={10}
                className="font-mono"
                placeholder="Write the base description to apply to selected videos..."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cta-link">Subscribe / CTA link</Label>
                  <Input
                    id="cta-link"
                    value={ctaLink}
                    onChange={(event) => setCtaLink(event.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resource-link">Resource highlight</Label>
                  <Input
                    id="resource-link"
                    value={resourceLink}
                    onChange={(event) => setResourceLink(event.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-background p-3">
                  <div>
                    <Label htmlFor="toggle-chapters" className="text-sm font-medium">
                      Auto-generate chapter markers
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Breaks longer videos into timestamps based on runtime so viewers skim faster.
                    </p>
                  </div>
                  <Switch
                    id="toggle-chapters"
                    checked={includeChapters}
                    onCheckedChange={(value) => setIncludeChapters(Boolean(value))}
                  />
                </div>
                <div className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-background p-3">
                  <div>
                    <Label htmlFor="toggle-resources" className="text-sm font-medium">
                      Append resource block
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Adds your evergreen offers and lead magnets so every upload pitches the same funnel.
                    </p>
                  </div>
                  <Switch
                    id="toggle-resources"
                    checked={includeResourceBlock}
                    onCheckedChange={(value) => setIncludeResourceBlock(Boolean(value))}
                  />
                </div>
                <div className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-background p-3">
                  <div>
                    <Label htmlFor="toggle-hashtags" className="text-sm font-medium">
                      Include hashtag footer
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Mirrors VidIQ's SEO presets with smart hashtags pulled from your metadata.
                    </p>
                  </div>
                  <Switch
                    id="toggle-hashtags"
                    checked={includeHashtags}
                    onCheckedChange={(value) => setIncludeHashtags(Boolean(value))}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  {hasSelection
                    ? `${selectedIds.length} video${selectedIds.length === 1 ? "" : "s"} ready for update.`
                    : "Select at least one video to enable bulk updates."}
                </p>
                <Button onClick={handleApply} disabled={!hasSelection || isApplying}>
                  {isApplying ? "Applying template…" : `Apply to ${selectedIds.length || 0} video${selectedIds.length === 1 ? "" : "s"}`}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-border/60 bg-background p-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">Preview</p>
                <p className="text-xs text-muted-foreground">
                  Live output for the first selected video so you can review before pushing live.
                </p>
              </div>
              {previewVideo && (
                <Badge variant="secondary" className="whitespace-nowrap">
                  {previewVideo ? new Date(previewVideo.uploadDate).toLocaleDateString() : ""}
                </Badge>
              )}
            </div>

            {previewVideo ? (
              <div className="space-y-4 text-sm">
                <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Original snippet</p>
                  <p className="mt-2 whitespace-pre-wrap text-muted-foreground/90">
                    {previewVideo.description ? previewVideo.description.slice(0, 400) : "No description provided yet."}
                    {previewVideo.description && previewVideo.description.length > 400 ? "…" : ""}
                  </p>
                </div>
                <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
                  <p className="text-xs font-semibold uppercase text-primary">Bulk template output</p>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-foreground">{previewDescription}</pre>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/80">Select a video to see a live preview of the updated description.</p>
            )}

            {Object.keys(updateHistory).length > 0 && (
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Recent bulk actions</p>
                <ul className="mt-2 space-y-2 text-xs text-muted-foreground/90">
                  {Object.entries(updateHistory)
                    .sort(([, a], [, b]) => b.appliedAt - a.appliedAt)
                    .slice(0, 5)
                    .map(([id, info]) => {
                      const video = videos.find((item) => item.id === id)
                      if (!video) return null
                      return (
                        <li key={id} className="flex flex-col gap-1">
                          <span className="font-medium text-foreground/90 line-clamp-1">{video.title}</span>
                          <span className="text-[11px] text-muted-foreground">Applied {formatRelativeTime(info.appliedAt)}</span>
                        </li>
                      )
                    })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
