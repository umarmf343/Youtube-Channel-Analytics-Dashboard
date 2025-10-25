"use client"

import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"

import { AppContext } from "@/lib/context"
import type { Video } from "@/lib/types"
import { fetchChannelVideos } from "@/lib/youtube-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

interface VideoEditorState extends Video {
  updatedDescription: string
  isSelected: boolean
}

type ApplyMode = "append" | "prepend" | "replace"

export default function BulkDescriptionEditor() {
  const app = useContext(AppContext)
  const channelId = app?.user?.channelId

  const [videos, setVideos] = useState<VideoEditorState[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [bulkSnippet, setBulkSnippet] = useState("")
  const [applyMode, setApplyMode] = useState<ApplyMode>("append")
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [lastApplied, setLastApplied] = useState<Date | null>(null)
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null)

  const loadVideos = useCallback(async () => {
    if (!channelId) {
      setVideos([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setApiError(null)

    try {
      const fetched = await fetchChannelVideos(channelId)
      setVideos(
        fetched.map((video) => ({
          ...video,
          updatedDescription: video.description,
          isSelected: false,
        })),
      )
      setPreviewId(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load channel videos"
      setApiError(message)
      setVideos([])
    } finally {
      setIsLoading(false)
    }
  }, [channelId])

  useEffect(() => {
    void loadVideos()
  }, [loadVideos])

  useEffect(() => {
    if (!videos.length) {
      setPreviewId(null)
      return
    }

    if (previewId && videos.some((video) => video.id === previewId)) {
      return
    }

    const nextId = videos.find((video) => video.isSelected)?.id ?? videos[0]?.id ?? null
    setPreviewId(nextId)
  }, [videos, previewId])

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) {
      return videos
    }

    const query = searchQuery.toLowerCase()
    return videos.filter((video) => video.title.toLowerCase().includes(query))
  }, [videos, searchQuery])

  const selectedVideos = useMemo(() => videos.filter((video) => video.isSelected), [videos])
  const selectedIds = useMemo(() => new Set(selectedVideos.map((video) => video.id)), [selectedVideos])

  const allFilteredSelected = useMemo(() => {
    if (!filteredVideos.length) return false
    return filteredVideos.every((video) => video.isSelected)
  }, [filteredVideos])

  const selectedCharacterTotal = useMemo(
    () => selectedVideos.reduce((total, video) => total + video.updatedDescription.length, 0),
    [selectedVideos],
  )

  const selectedAverageLength = selectedVideos.length
    ? Math.round(selectedCharacterTotal / selectedVideos.length)
    : 0

  const previewVideo = previewId ? videos.find((video) => video.id === previewId) ?? null : null

  useEffect(() => {
    if (!bulkSuccess || typeof window === "undefined") {
      return
    }

    const timeout = window.setTimeout(() => setBulkSuccess(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [bulkSuccess])

  const handleToggleVideo = (videoId: string, isChecked: boolean) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? {
              ...video,
              isSelected: isChecked,
            }
          : video,
      ),
    )
    setBulkError(null)
    setBulkSuccess(null)

    if (isChecked) {
      setPreviewId((current) => current ?? videoId)
    } else if (previewId === videoId) {
      setPreviewId(null)
    }
  }

  const handleSelectAllFiltered = () => {
    if (!filteredVideos.length) return

    const shouldSelectAll = !allFilteredSelected
    const filteredIds = new Set(filteredVideos.map((video) => video.id))

    setVideos((prev) =>
      prev.map((video) =>
        filteredIds.has(video.id)
          ? {
              ...video,
              isSelected: shouldSelectAll,
            }
          : video,
      ),
    )
    setBulkError(null)

    if (shouldSelectAll && filteredVideos.length) {
      setPreviewId((current) => current ?? filteredVideos[0].id)
    }
  }

  const handleClearSelection = () => {
    if (!selectedIds.size) return
    setVideos((prev) => prev.map((video) => ({ ...video, isSelected: false })))
    setPreviewId(null)
    setBulkError(null)
  }

  const handleApplyBulkUpdate = () => {
    if (!bulkSnippet.trim()) {
      setBulkError("Add the copy you want to apply before running the bulk update.")
      return
    }

    if (!selectedIds.size) {
      setBulkError("Select at least one video to update its description.")
      return
    }

    setBulkError(null)
    setBulkSuccess(null)
    const snippet = bulkSnippet
    const appliedAt = new Date()

    setVideos((prev) =>
      prev.map((video) => {
        if (!selectedIds.has(video.id)) {
          return video
        }

        const existing = video.updatedDescription

        if (applyMode === "replace") {
          return {
            ...video,
            updatedDescription: snippet,
          }
        }

        if (applyMode === "prepend") {
          const updated = existing ? `${snippet}\n\n${existing}` : snippet
          return {
            ...video,
            updatedDescription: updated,
          }
        }

        const updated = existing ? `${existing}\n\n${snippet}` : snippet
        return {
          ...video,
          updatedDescription: updated,
        }
      }),
    )

    setLastApplied(appliedAt)
    setBulkSuccess("Bulk description update applied. Review changes in the preview panel.")
  }

  const handleResetSelected = () => {
    if (!selectedIds.size) return

    setVideos((prev) =>
      prev.map((video) =>
        selectedIds.has(video.id)
          ? {
              ...video,
              updatedDescription: video.description,
            }
          : video,
      ),
    )
    setBulkError(null)
  }

  const handleResetAll = () => {
    if (!videos.length) return
    setVideos((prev) => prev.map((video) => ({ ...video, updatedDescription: video.description, isSelected: false })))
    setPreviewId(null)
    setBulkError(null)
    setBulkSuccess(null)
  }

  const updatePreviewDescription = (value: string) => {
    if (!previewVideo) return
    const videoId = previewVideo.id

    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? {
              ...video,
              updatedDescription: value,
              isSelected: true,
            }
          : video,
      ),
    )
    setBulkError(null)
  }

  const handleCopyPreview = async () => {
    if (!previewVideo) return

    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable")
      }
      await navigator.clipboard.writeText(previewVideo.updatedDescription)
    } catch (err) {
      console.error("[BulkDescriptionEditor] Unable to copy description", err)
    }
  }

  const renderVideoMeta = (video: VideoEditorState) => {
    const uploadDate = new Date(video.uploadDate)
    const relativeUpload = Number.isNaN(uploadDate.getTime())
      ? null
      : formatDistanceToNow(uploadDate, { addSuffix: true })
    const delta = video.updatedDescription.length - video.description.length

    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {relativeUpload ? <span>{relativeUpload}</span> : null}
        <span>•</span>
        <span>{video.updatedDescription.length} chars</span>
        {delta !== 0 ? (
          <span className={delta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
            {delta > 0 ? `+${delta}` : delta}
          </span>
        ) : null}
      </div>
    )
  }

  if (!app?.user) {
    return (
      <div className="p-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Bulk Description Editor</CardTitle>
            <CardDescription>Sign in to connect your YouTube channel and manage descriptions in bulk.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Once you authenticate your channel, VidIStream will surface your latest uploads so you can apply templates, calls to
              action, and SEO rich copy across multiple videos in just a few clicks.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Bulk Description Editor</h1>
          <p className="text-muted-foreground max-w-2xl">
            Update multiple video descriptions simultaneously to keep channel messaging consistent, roll out SEO updates faster, and
            eliminate copy-paste loops.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetAll} disabled={!videos.length}>
            Reset all
          </Button>
          <Button onClick={() => void loadVideos()} disabled={isLoading}>
            {isLoading ? <Spinner className="mr-2" /> : null}
            Refresh list
          </Button>
        </div>
      </div>

      {apiError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {apiError}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.75fr,1fr]">
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Channel uploads</CardTitle>
              <CardDescription>Select the videos you want to update and apply shared copy in one pass.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <Input
                  placeholder="Filter by video title"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="bg-input lg:max-w-sm"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAllFiltered} disabled={!filteredVideos.length}>
                    {allFilteredSelected ? "Deselect filtered" : "Select filtered"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    disabled={!selectedIds.size}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear selection
                  </Button>
                  {selectedIds.size ? (
                    <Badge variant="secondary" className="text-xs">
                      {selectedIds.size} selected
                    </Badge>
                  ) : null}
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Spinner className="mr-2 h-5 w-5" /> Loading channel videos…
                </div>
              ) : !filteredVideos.length ? (
                <div className="rounded-lg border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground">
                  {searchQuery.trim()
                    ? "No videos matched your search. Clear the filter to see all uploads."
                    : "We couldn't find any videos for this channel yet."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <span className="sr-only">Select</span>
                      </TableHead>
                      <TableHead>Video</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVideos.map((video) => {
                      const isActive = previewId === video.id
                      const isUpdated = video.updatedDescription !== video.description

                      return (
                        <TableRow
                          key={video.id}
                          data-state={video.isSelected ? "selected" : undefined}
                          className={`cursor-pointer ${isActive ? "ring-1 ring-primary" : ""}`}
                          onClick={() => setPreviewId(video.id)}
                        >
                          <TableCell onClick={(event) => event.stopPropagation()}>
                            <Checkbox
                              checked={video.isSelected}
                              onCheckedChange={(checked) => handleToggleVideo(video.id, checked === true)}
                              aria-label={`Select ${video.title}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-sm text-foreground line-clamp-2" title={video.title}>
                                {video.title}
                              </p>
                              {renderVideoMeta(video)}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              {isUpdated ? <Badge variant="outline">Edited</Badge> : <Badge variant="secondary">Original</Badge>}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Bulk update</CardTitle>
              <CardDescription>Craft reusable CTAs, promotional snippets, or policy updates and roll them out instantly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bulkError ? (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {bulkError}
                </div>
              ) : null}
              {bulkSuccess ? (
                <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-300">
                  {bulkSuccess}
                </div>
              ) : null}
              <div className="grid gap-4 lg:grid-cols-[1fr,200px]">
                <Textarea
                  placeholder="Add a consistent call-to-action, new social links, sponsor copy, or updated FTC disclosures."
                  value={bulkSnippet}
                  onChange={(event) => {
                    setBulkSnippet(event.target.value)
                    setBulkError(null)
                  }}
                  className="min-h-[160px]"
                />
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Apply mode</p>
                    <Select value={applyMode} onValueChange={(value) => setApplyMode(value as ApplyMode)}>
                      <SelectTrigger className="w-full justify-between">
                        <SelectValue placeholder="Choose mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="append">Append to end</SelectItem>
                        <SelectItem value="prepend">Prepend to top</SelectItem>
                        <SelectItem value="replace">Replace existing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Selected videos</span>
                      <span className="font-medium text-foreground">{selectedVideos.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Average length</span>
                      <span className="font-medium text-foreground">{selectedAverageLength} chars</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total characters</span>
                      <span className="font-medium text-foreground">{selectedCharacterTotal.toLocaleString()}</span>
                    </div>
                    {lastApplied ? (
                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span>Last bulk edit</span>
                        <span className="font-medium text-foreground">
                          {formatDistanceToNow(lastApplied, { addSuffix: true })}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={handleApplyBulkUpdate} disabled={isLoading || !videos.length}>
                  Apply to selected
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetSelected}
                  disabled={!selectedIds.size}
                >
                  Restore selected originals
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 h-fit">
          <CardHeader>
            <CardTitle>Preview & fine-tune</CardTitle>
            <CardDescription>Adjust individual descriptions before exporting to YouTube Studio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!previewVideo ? (
              <div className="rounded-lg border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground">
                Select a video to preview and customize its final description.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground leading-tight">{previewVideo.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{previewVideo.updatedDescription.length} characters</span>
                    <span>•</span>
                    <span>{previewVideo.tags.slice(0, 2).join(", ") || "No tags"}</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Original copy</p>
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border/40 bg-muted/40 p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                      {previewVideo.description || "This upload does not have a description yet."}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <p className="font-medium uppercase tracking-wide">Edited description</p>
                      <span>{previewVideo.updatedDescription.length} chars</span>
                    </div>
                    <Textarea
                      value={previewVideo.updatedDescription}
                      onChange={(event) => updatePreviewDescription(event.target.value)}
                      className="mt-2 min-h-[200px]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={() => updatePreviewDescription(previewVideo.description)}>
                    Restore original
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleCopyPreview}>
                    Copy to clipboard
                  </Button>
                  {previewVideo.updatedDescription !== previewVideo.description ? (
                    <Badge variant="outline">Not synced</Badge>
                  ) : (
                    <Badge variant="secondary">Original</Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
