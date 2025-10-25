
"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, ClipboardCheck, ClipboardCopy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { cn, formatNumber } from "@/lib/utils"
import type { User, Video } from "@/lib/types"
import { fetchChannelVideos } from "@/lib/youtube-api"

interface BulkDescriptionEditorProps {
  user: User
}

type DraftMap = Record<string, string>

type SelectionSet = Set<string>

function parseHashtags(input: string): string[] {
  return input
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
}

function getPublishDateLabel(uploadDate: string): string {
  const date = new Date(uploadDate)
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}

export default function BulkDescriptionEditor({ user }: BulkDescriptionEditorProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [drafts, setDrafts] = useState<DraftMap>({})
  const [selection, setSelection] = useState<SelectionSet>(() => new Set<string>())
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
  const [template, setTemplate] = useState(
    `Hey {channel} community! In today's video we dive into "{title}" and unpack the exact strategies you can apply right away.

What you'll learn:
• Why this topic matters for creators right now
• Actionable steps to follow along
• Bonus resources linked below

{cta}`,
  )
  const [cta, setCta] = useState(
    `👍 Subscribe for weekly creator growth strategies
🔔 Turn on notifications so you never miss a drop
💬 Let me know your biggest takeaway in the comments!`,
  )
  const [linksBlock, setLinksBlock] = useState(
    `Resources:
Creator Growth Playbook → https://vidistream.ai/playbook
My favorite YouTube tools → https://vidistream.ai/stack`,
  )
  const [hashtagsInput, setHashtagsInput] = useState("#YouTubeGrowth #CreatorTips #VidIStream")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true

    const loadVideos = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchChannelVideos(user.channelId)
        if (!isMounted) return

        setVideos(data)
        setDrafts((previous) => {
          const next: DraftMap = {}
          for (const video of data) {
            next[video.id] = previous[video.id] ?? video.description
          }
          return next
        })
        setSelection((previous) => {
          const next = new Set<string>()
          for (const video of data) {
            if (previous.has(video.id)) {
              next.add(video.id)
            }
          }
          return next
        })
      } catch (err) {
        if (!isMounted) return
        const message = err instanceof Error ? err.message : "Unable to load videos"
        setError(message)
        setVideos([])
        setDrafts({})
        setSelection(new Set<string>())
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadVideos()

    return () => {
      isMounted = false
    }
  }, [user.channelId])

  useEffect(() => {
    if (!selection.size) {
      setActiveVideoId(null)
      return
    }

    setActiveVideoId((current) => {
      if (current && selection.has(current)) {
        return current
      }
      return Array.from(selection)[0] ?? null
    })
  }, [selection])

  const hashtags = useMemo(() => parseHashtags(hashtagsInput), [hashtagsInput])

  const selectedCount = selection.size
  const modifiedCount = useMemo(() => {
    return videos.reduce((count, video) => {
      const draft = drafts[video.id]
      if (draft === undefined) {
        return count
      }
      return normalize(draft) !== normalize(video.description) ? count + 1 : count
    }, 0)
  }, [drafts, videos])

  const totalVideos = videos.length
  const progressValue = totalVideos > 0 ? Math.round((modifiedCount / totalVideos) * 100) : 0

  const activeVideo = activeVideoId ? videos.find((video) => video.id === activeVideoId) ?? null : null
  const activeDraft = activeVideo ? drafts[activeVideo.id] ?? "" : ""
  const activeIsModified = activeVideo
    ? normalize(drafts[activeVideo.id] ?? activeVideo.description) !== normalize(activeVideo.description)
    : false
  const activeCharacterCount = activeDraft.length
  const activeWordCount = activeDraft.trim() ? activeDraft.trim().split(/\s+/).length : 0

  const templateIncludesCta = template.includes("{cta}")
  const templateIncludesLinks = template.includes("{links}")
  const templateIncludesHashtags = template.includes("{hashtags}")

  const buildDescription = (video: Video) => {
    const publishDate = getPublishDateLabel(video.uploadDate)
    const ctaBlock = cta.trim()
    const linksSection = linksBlock.trim()
    const hashtagsLine = hashtags.join(" ")

    const replacements: Record<string, string> = {
      "{title}": video.title,
      "{channel}": user.channelName,
      "{publishDate}": publishDate,
      "{cta}": ctaBlock,
      "{links}": linksSection,
      "{hashtags}": hashtagsLine,
    }

    let body = template
    for (const [token, value] of Object.entries(replacements)) {
      body = body.replaceAll(token, value)
    }

    const sections: string[] = []
    if (body.trim()) {
      sections.push(body.trim())
    }
    if (!templateIncludesCta && ctaBlock) {
      sections.push(ctaBlock)
    }
    if (!templateIncludesLinks && linksSection) {
      sections.push(linksSection)
    }
    if (!templateIncludesHashtags && hashtagsLine) {
      sections.push(hashtagsLine)
    }

    return sections.filter(Boolean).join("\n\n").trim()
  }

  const updateSelection = (videoId: string, isSelected: boolean) => {
    setSelection((previous) => {
      const next = new Set(previous)
      if (isSelected) {
        next.add(videoId)
      } else {
        next.delete(videoId)
      }
      return next
    })
  }

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelection(new Set(videos.map((video) => video.id)))
    } else {
      setSelection(new Set<string>())
    }
  }

  const handleApplyTemplate = () => {
    if (!selectedCount) {
      toast({
        title: "Select videos first",
        description: "Choose at least one video before applying the template.",
        variant: "destructive",
      })
      return
    }

    const selectedIds = Array.from(selection)
    setDrafts((previous) => {
      const next: DraftMap = { ...previous }
      for (const id of selectedIds) {
        const video = videos.find((item) => item.id === id)
        if (!video) continue
        next[id] = buildDescription(video)
      }
      return next
    })

    toast({
      title: "Template applied",
      description: `Updated ${selectedIds.length} ${selectedIds.length === 1 ? "description" : "descriptions"}.`,
    })
  }

  const handleResetSelected = () => {
    if (!selectedCount) {
      toast({
        title: "Nothing selected",
        description: "Pick at least one video to reset.",
        variant: "destructive",
      })
      return
    }

    const selectedIds = Array.from(selection)
    setDrafts((previous) => {
      const next: DraftMap = { ...previous }
      for (const id of selectedIds) {
        const video = videos.find((item) => item.id === id)
        if (!video) continue
        next[id] = video.description
      }
      return next
    })

    toast({
      title: "Drafts restored",
      description: `Reverted ${selectedIds.length} ${selectedIds.length === 1 ? "description" : "descriptions"} to the original copy.`,
    })
  }

  const handleResetSingle = (videoId: string) => {
    const video = videos.find((item) => item.id === videoId)
    if (!video) return

    setDrafts((previous) => ({
      ...previous,
      [videoId]: video.description,
    }))
  }

  const handleCopyDraft = async (videoId: string) => {
    const draft = drafts[videoId]
    if (!draft) {
      toast({
        title: "Nothing to copy",
        description: "Generate or edit a description before copying.",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(draft)
      toast({
        title: "Copied to clipboard",
        description: "Your optimized description is ready to paste.",
      })
    } catch (err) {
      console.error("Failed to copy description", err)
      toast({
        title: "Copy failed",
        description: "We couldn't access the clipboard. Try again manually.",
        variant: "destructive",
      })
    }
  }

  const allSelected = totalVideos > 0 && selection.size === totalVideos

  const tokenLegend = [
    { token: "{title}", description: "Replaced with the video title" },
    { token: "{channel}", description: "Your channel name" },
    { token: "{publishDate}", description: "Formatted upload date" },
    { token: "{cta}", description: "Call-to-action block" },
    { token: "{links}", description: "Resource links section" },
    { token: "{hashtags}", description: "Formatted hashtags" },
  ]

  const bestPractices = [
    "Hook viewers in the first 150 characters to stay above the fold.",
    "Summarize the value viewers will get in two keyword-rich sentences.",
    "Group key links with consistent labels (lead magnet, community, gear list).",
    "Close with 3–5 branded hashtags to reinforce search relevance.",
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Bulk Description Editor</h1>
        <p className="text-muted-foreground">
          Apply SEO-aligned description templates across your library in a few clicks. Select the videos you want to update,
          generate consistent messaging, and export drafts for publishing.
        </p>
      </div>

      {isLoading ? (
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-2 py-12 text-muted-foreground">
            <Spinner className="h-4 w-4" />
            Loading your recent uploads…
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-border/50">
          <CardContent className="py-12">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : !videos.length ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-muted-foreground">
            We couldn’t find any videos for this channel yet. Once you have uploads, they’ll appear here for bulk editing.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Build your reusable template</CardTitle>
                <CardDescription>
                  Draft a description once, then apply it to every selected video. Use dynamic tokens to personalize each version.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="description-template">Primary description</Label>
                  <Textarea
                    id="description-template"
                    value={template}
                    onChange={(event) => setTemplate(event.target.value)}
                    className="min-h-[200px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tokens like <code className="rounded bg-muted px-1">{`{title}`}</code> and <code className="rounded bg-muted px-1">{`{channel}`}</code>
                    automatically personalize each description.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cta-block">Channel CTA</Label>
                    <Textarea
                      id="cta-block"
                      value={cta}
                      onChange={(event) => setCta(event.target.value)}
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground">Will append automatically if you don’t place {`{cta}`} in the template.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="links-block">Resource links</Label>
                    <Textarea
                      id="links-block"
                      value={linksBlock}
                      onChange={(event) => setLinksBlock(event.target.value)}
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground">List lead magnets, community links, or gear with one per line.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hashtags-input">Hashtags</Label>
                  <Input
                    id="hashtags-input"
                    value={hashtagsInput}
                    onChange={(event) => setHashtagsInput(event.target.value)}
                    placeholder="#YouTubeGrowth #CreatorTips"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate with spaces or commas. We’ll cap them at one line and add missing # symbols automatically.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border/60 pt-4 text-sm">
                  <div className="space-y-1 text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">{selectedCount}</span> selected • <span className="font-medium text-foreground">{modifiedCount}</span> updated drafts
                    </p>
                    <p className="text-xs">Progress reflects how many videos currently have edited descriptions.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleResetSelected} disabled={!selectedCount}>
                      Restore selected
                    </Button>
                    <Button size="sm" onClick={handleApplyTemplate} disabled={!selectedCount}>
                      Apply template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader className="space-y-1">
                  <CardTitle>Batch status</CardTitle>
                  <CardDescription>Monitor selection progress before exporting.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total videos</span>
                      <span className="font-medium text-foreground">{totalVideos}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Selected</span>
                      <span className="font-medium text-foreground">{selectedCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Updated drafts</span>
                      <span className="font-medium text-foreground">{modifiedCount}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                      <span>Description coverage</span>
                      <span>{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Template variables</CardTitle>
                  <CardDescription>Drop these tokens into your copy to personalize at scale.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {tokenLegend.map((item) => (
                    <div key={item.token} className="flex items-start justify-between gap-3">
                      <code className="rounded bg-muted px-2 py-1 text-xs font-medium">{item.token}</code>
                      <span className="text-muted-foreground">{item.description}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Optimization checklist</CardTitle>
                  <CardDescription>Keep every upload aligned with YouTube SEO best practices.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {bestPractices.map((tip) => (
                    <div key={tip} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span className="text-muted-foreground">{tip}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Video library</CardTitle>
                    <CardDescription>Select the videos you want to update or review.</CardDescription>
                  </div>
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all videos"
                    className="mt-1"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">&nbsp;</TableHead>
                      <TableHead>Video</TableHead>
                      <TableHead className="hidden xl:table-cell">Draft preview</TableHead>
                      <TableHead className="w-32 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => {
                      const draft = drafts[video.id] ?? video.description
                      const isSelected = selection.has(video.id)
                      const isModified = normalize(draft) !== normalize(video.description)
                      const preview = draft.split(/
+/)[0]?.trim() ?? ""

                      return (
                        <TableRow
                          key={video.id}
                          data-state={isSelected ? "selected" : undefined}
                          className="cursor-pointer"
                          onClick={() => setActiveVideoId(video.id)}
                        >
                          <TableCell onClick={(event) => event.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => updateSelection(video.id, checked === true)}
                              aria-label={`Select ${video.title}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground line-clamp-2">{video.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatNumber(video.views)} views • {getPublishDateLabel(video.uploadDate)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <p className="text-xs text-muted-foreground line-clamp-2 whitespace-normal">{preview || "—"}</p>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "px-2 py-0.5",
                                  isModified
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-300"
                                    : "text-muted-foreground",
                                )}
                              >
                                {isModified ? "Updated" : "Original"}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1 text-xs text-muted-foreground"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleResetSingle(video.id)
                                }}
                                disabled={!isModified}
                              >
                                Reset
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Preview & fine-tune</CardTitle>
                <CardDescription>
                  {activeVideo
                    ? `Editing ${activeVideo.title}`
                    : "Select a video to preview and finalize its description."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeVideo ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant="outline"
                        className={cn(
                          activeIsModified
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {activeIsModified ? "Draft updated" : "Matches original"}
                      </Badge>
                      <span>{activeCharacterCount} characters</span>
                      <span>•</span>
                      <span>{activeWordCount} words</span>
                    </div>
                    <Textarea
                      value={activeDraft}
                      onChange={(event) =>
                        activeVideo &&
                        setDrafts((previous) => ({
                          ...previous,
                          [activeVideo.id]: event.target.value,
                        }))
                      }
                      className="min-h-[260px]"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetSingle(activeVideo.id)}
                        disabled={!activeIsModified}
                      >
                        Restore original
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyDraft(activeVideo.id)}
                      >
                        <ClipboardCopy className="mr-1 h-4 w-4" /> Copy draft
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          handleApplyTemplate()
                          setActiveVideoId(activeVideo.id)
                        }}
                      >
                        <ClipboardCheck className="mr-1 h-4 w-4" /> Rebuild from template
                      </Button>
                    </div>
                    <div className="rounded-md border border-dashed border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
                      <p className="mb-1 font-medium text-foreground">Original description</p>
                      <p className="max-h-40 overflow-y-auto whitespace-pre-wrap">{activeVideo.description || "—"}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Pick a video from the table to preview the generated description, tweak language, or copy it to your clipboard.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
