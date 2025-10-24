"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { mockShortVideoBlueprints } from "@/lib/mock-data"
import type { ShortVideoBlueprint, ShortVideoConfig } from "@/lib/types"

const orientations: ShortVideoConfig["orientation"][] = ["portrait", "square", "landscape"]
const voices = ["Energetic Female", "Neutral Male", "Bold Narrator", "Upbeat Youthful"]
const captionPositions: ShortVideoConfig["captionPosition"][] = ["top", "middle", "bottom"]
const musicVolumes: ShortVideoConfig["musicVolume"][] = ["low", "medium", "high"]
const captionStyles = ["Bold neon", "High contrast", "Minimal", "Pop art"]
const musicOptions = ["Energetic Synthwave", "Lo-fi Focus", "Upbeat Pop", "Epic Cinematic"]

export default function ShortsStudio() {
  const [blueprintId, setBlueprintId] = useState(mockShortVideoBlueprints[0].id)
  const [config, setConfig] = useState<ShortVideoConfig>(mockShortVideoBlueprints[0].config)
  const [autoCaptions, setAutoCaptions] = useState(true)
  const [autoBroll, setAutoBroll] = useState(true)

  const blueprint = useMemo<ShortVideoBlueprint | undefined>(
    () => mockShortVideoBlueprints.find((item) => item.id === blueprintId),
    [blueprintId],
  )

  useEffect(() => {
    if (blueprint) {
      setConfig(blueprint.config)
    }
  }, [blueprint])

  const updateConfig = <K extends keyof ShortVideoConfig>(key: K, value: ShortVideoConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  if (!blueprint) {
    return null
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-foreground">Shorts Studio</h2>
        <p className="text-muted-foreground">
          We merged the Remotion-powered short-video-maker project directly into VidIStream. Craft snackable scripts, tweak
          render configs, and sync automation without leaving the dashboard.
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle>Blueprint Selector</CardTitle>
            <CardDescription>Start with a proven template, then customise the render stack.</CardDescription>
          </div>
          <Select value={blueprintId} onValueChange={setBlueprintId}>
            <SelectTrigger className="w-full lg:w-80">
              <SelectValue placeholder="Choose a blueprint" />
            </SelectTrigger>
            <SelectContent>
              {mockShortVideoBlueprints.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 rounded-lg bg-muted/20 border border-border/60 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{blueprint.title}</p>
                <p className="text-xs text-muted-foreground">Category: {blueprint.category}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {blueprint.performance.suggestedHashtags.map((hashtag) => (
                  <Badge key={hashtag} variant="outline" className="bg-primary/10 text-primary">
                    {hashtag}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator className="bg-border/60" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-lg border border-border/60 bg-muted/10">
                <p className="text-xs text-muted-foreground uppercase">Retention</p>
                <p className="text-lg font-semibold text-foreground">{blueprint.performance.retention}%</p>
              </div>
              <div className="p-3 rounded-lg border border-border/60 bg-muted/10">
                <p className="text-xs text-muted-foreground uppercase">Completion</p>
                <p className="text-lg font-semibold text-foreground">{blueprint.performance.completionRate}%</p>
              </div>
              <div className="p-3 rounded-lg border border-border/60 bg-muted/10">
                <p className="text-xs text-muted-foreground uppercase">Scenes</p>
                <p className="text-lg font-semibold text-foreground">{blueprint.scenes.length}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Workflow Notes</p>
            <p>1. Sync this blueprint to Automation Hub to auto-schedule community hype posts post-publication.</p>
            <p>2. Use the AI SEO Studio output as your video description + pinned comment.</p>
            <p>3. Export the scene list to Remotion if you want a full render, or push to CapCut via CSV.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="border-border/60 xl:col-span-2">
          <CardHeader>
            <CardTitle>Scene Breakdown</CardTitle>
            <CardDescription>Lifted from the short-video-maker router—each scene keeps search terms front-and-centre.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {blueprint.scenes.map((scene, index) => (
              <div key={scene.id} className="p-4 rounded-lg border border-border/60 bg-muted/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Scene {index + 1}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{scene.text}</p>
                  </div>
                  <Badge variant="outline" className="bg-secondary/20 text-secondary-foreground">
                    {scene.duration}s
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {scene.searchTerms.map((term) => (
                    <Badge key={term} variant="secondary">
                      #{term}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            <Button variant="outline">Export scenes to CSV</Button>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Render Controls</CardTitle>
            <CardDescription>Adjust config before sending to the Remotion render queue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Orientation</p>
              <Select value={config.orientation} onValueChange={(value) => updateConfig("orientation", value as ShortVideoConfig["orientation"]) }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orientations.map((orientation) => (
                    <SelectItem key={orientation} value={orientation}>
                      {orientation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Voice</p>
              <Select value={config.voice} onValueChange={(value) => updateConfig("voice", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice} value={voice}>
                      {voice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Caption position</p>
              <Select
                value={config.captionPosition}
                onValueChange={(value) => updateConfig("captionPosition", value as ShortVideoConfig["captionPosition"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {captionPositions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Caption style</p>
              <Select value={config.captionStyle} onValueChange={(value) => updateConfig("captionStyle", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {captionStyles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Music</p>
              <Select value={config.music} onValueChange={(value) => updateConfig("music", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {musicOptions.map((music) => (
                    <SelectItem key={music} value={music}>
                      {music}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Music volume</p>
              <Select
                value={config.musicVolume}
                onValueChange={(value) => updateConfig("musicVolume", value as ShortVideoConfig["musicVolume"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {musicVolumes.map((volume) => (
                    <SelectItem key={volume} value={volume}>
                      {volume}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Switch id="auto-captions" checked={autoCaptions} onCheckedChange={setAutoCaptions} />
              <label htmlFor="auto-captions" className="text-sm text-muted-foreground">
                Auto-generate captions with emphasised keywords
              </label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="auto-broll" checked={autoBroll} onCheckedChange={setAutoBroll} />
              <label htmlFor="auto-broll" className="text-sm text-muted-foreground">
                Suggest B-roll from stock + channel archive
              </label>
            </div>

            <Button className="w-full">Generate production brief</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Delivery Checklist</CardTitle>
          <CardDescription>Bridge the gap between shorts production and the rest of the VidIStream automation.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
          <div className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-2">
            <p className="font-semibold text-foreground">Automation Hub</p>
            <p>Send this short to the Automation Hub to queue community posts, email nudges, and paid boosts.</p>
          </div>
          <div className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-2">
            <p className="font-semibold text-foreground">SEO Studio</p>
            <p>Pair the short with metadata variations generated in AI SEO Studio for consistent messaging.</p>
          </div>
          <div className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-2">
            <p className="font-semibold text-foreground">Keyword Lab</p>
            <p>Use the Keyword Suggestion Lab to append trending tags to your short before publishing.</p>
          </div>
          <div className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-2">
            <p className="font-semibold text-foreground">Analytics Sync</p>
            <p>Monitor retention + completion inside Analytics → Videos tab once published.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

