"use client"

import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { mockSeoOptions } from "@/lib/mock-data"
import type { SeoContentOption } from "@/lib/types"
import { formatNumber } from "@/lib/utils"

const emotionalTriggers = [
  "Unbelievable",
  "Essential",
  "Exclusive",
  "Magnetic",
  "High-Impact",
  "Instant",
  "Proven",
  "Effortless",
  "Next-Level",
]

const tonalities = ["Authoritative", "Analytical", "Excited", "Playful", "Inspirational"]

const hookAngles = [
  "Blueprint",
  "Cheat Sheet",
  "Crash Course",
  "Playbook",
  "Power Moves",
  "Workflow",
  "Secrets",
]

const callToActionTemplates = [
  "Subscribe for weekly {keyword} deep-dives.",
  "Comment the toughest challenge you want solved next.",
  "Share this with a teammate who needs a {keyword} boost.",
  "Download the companion checklist linked below.",
]

const analyticsBenchmarks = {
  views: [145000, 215000],
  likes: [7200, 11800],
  comments: [1500, 2600],
  shares: [480, 840],
  watchTime: [3800, 6200],
}

function buildSeoOption(keyword: string, tone: string, hook: string, variant: number, includeCrossPromo: boolean): SeoContentOption {
  const normalized = keyword.trim() || "youtube growth"
  const words = normalized.split(" ")
  const trigger = emotionalTriggers[(variant + words.length) % emotionalTriggers.length]
  const structure = `${trigger} ${hook}: ${normalized.replace(/\b\w/g, (char) => char.toUpperCase())}`
  const shortNumber = (variant + 1) * 5
  const title = `${structure} (${shortNumber} ${tone} Wins)`

  const descriptionBlocks = [
    `${trigger}! This ${tone.toLowerCase()} walkthrough reveals how to master ${normalized} in record time.`,
    `Inside we detail ${hook.toLowerCase()} strategies, real channel experiments, and on-screen implementation demos you can copy.`,
  ]

  if (includeCrossPromo) {
    descriptionBlocks.push(`BONUS: ${callToActionTemplates[variant % callToActionTemplates.length]}`.replaceAll(
      "{keyword}",
      normalized,
    ))
  }

  const description = descriptionBlocks.join("\n\n")

  const baseTags = Array.from(new Set([normalized, ...words, `${normalized} tutorial`, `${normalized} strategy`]))
  const supporting = ["growth hacks", "algorithm", "content system", `${hook.toLowerCase()}`, `${tone.toLowerCase()} guide`]
  const tags = [...baseTags, ...supporting].slice(0, 15)

  const hashtags = tags
    .slice(0, 6)
    .map((tag) => `#${tag.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "")}`)

  const seoScore = Math.min(88 + variant * 3 + tone.length % 5, 99)

  const estimatedMetrics = {
    views:
      analyticsBenchmarks.views[0] +
      Math.floor((analyticsBenchmarks.views[1] - analyticsBenchmarks.views[0]) * (0.35 + Math.random() * 0.4)),
    likes:
      analyticsBenchmarks.likes[0] +
      Math.floor((analyticsBenchmarks.likes[1] - analyticsBenchmarks.likes[0]) * (0.25 + Math.random() * 0.5)),
    comments:
      analyticsBenchmarks.comments[0] +
      Math.floor((analyticsBenchmarks.comments[1] - analyticsBenchmarks.comments[0]) * (0.3 + Math.random() * 0.4)),
    shares:
      analyticsBenchmarks.shares[0] +
      Math.floor((analyticsBenchmarks.shares[1] - analyticsBenchmarks.shares[0]) * (0.3 + Math.random() * 0.5)),
    watchTime:
      analyticsBenchmarks.watchTime[0] +
      Math.floor((analyticsBenchmarks.watchTime[1] - analyticsBenchmarks.watchTime[0]) * (0.3 + Math.random() * 0.4)),
  }

  return {
    id: `seo-${Date.now()}-${variant}`,
    keyword: normalized,
    tone,
    hook,
    title,
    description,
    tags,
    hashtags,
    seoScore,
    estimatedMetrics,
  }
}

export default function AiSeoStudio() {
  const [keyword, setKeyword] = useState(mockSeoOptions[0].keyword)
  const [tone, setTone] = useState(mockSeoOptions[0].tone)
  const [hook, setHook] = useState(hookAngles[0])
  const [includeCrossPromo, setIncludeCrossPromo] = useState(true)
  const [options, setOptions] = useState<SeoContentOption[]>(mockSeoOptions)

  const bestPerformer = useMemo(() => options.reduce((prev, curr) => (curr.seoScore > prev.seoScore ? curr : prev), options[0]), [
    options,
  ])

  const handleGenerate = () => {
    const variants = Array.from({ length: 2 }, (_, index) => buildSeoOption(keyword, tone, hook, index, includeCrossPromo))
    setOptions(variants)
  }

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch (error) {
      console.error("Clipboard copy failed", error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-foreground">AI SEO Studio</h2>
        <p className="text-muted-foreground">
          A fusion of the Advanced YouTube SEO Generator with VidIStream&apos;s analytics context. Generate battle-tested titles,
          descriptions, and metadata in one click.
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Input Controls</CardTitle>
          <CardDescription>Guide the generator with tone and hook preferences—no Python runtime required.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Primary keyword</label>
              <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="e.g. react hooks tutorial" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a tone" />
                </SelectTrigger>
                <SelectContent>
                  {tonalities.map((toneOption) => (
                    <SelectItem key={toneOption} value={toneOption}>
                      {toneOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Hook</label>
              <Select value={hook} onValueChange={setHook}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a hook" />
                </SelectTrigger>
                <SelectContent>
                  {hookAngles.map((hookOption) => (
                    <SelectItem key={hookOption} value={hookOption}>
                      {hookOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Switch checked={includeCrossPromo} onCheckedChange={setIncludeCrossPromo} id="cross-promo" />
              <label htmlFor="cross-promo" className="text-sm text-muted-foreground">
                Include cross-promotion CTA and distribution prompts
              </label>
            </div>
            <Button onClick={handleGenerate}>Generate fresh variants</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Strategy Summary</CardTitle>
          <CardDescription>
            Highest ranking variant currently scores {bestPerformer.seoScore}/100 with projected {formatNumber(bestPerformer.estimatedMetrics.views)}
            views.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 p-4 rounded-lg bg-muted/30 border border-border/60 space-y-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Top performing variant</p>
            <p className="text-lg font-semibold text-foreground">{bestPerformer.title}</p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">Tone: {bestPerformer.tone}</Badge>
              <Badge variant="outline">Hook: {bestPerformer.hook}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Suggested launch window: 24h before your next scheduled long-form upload to maximise browse traffic uplift.
            </p>
          </div>
          {["views", "likes", "comments", "shares"].map((metric) => (
            <div key={metric} className="p-4 rounded-lg border border-border/60 bg-muted/10">
              <p className="text-xs text-muted-foreground uppercase">Projected {metric}</p>
              <p className="text-lg font-semibold text-foreground">
                {formatNumber(bestPerformer.estimatedMetrics[metric as keyof typeof bestPerformer.estimatedMetrics])}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Generated Variants</CardTitle>
          <CardDescription>Inspired by the Python generator—now interactive and ready to copy into your uploads.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={options[0]?.id} className="space-y-4">
            <TabsList className="w-full overflow-x-auto">
              {options.map((option, index) => (
                <TabsTrigger key={option.id} value={option.id} className="flex items-center gap-2">
                  Variant {index + 1}
                  <Badge variant="outline" className="text-xs">
                    {option.seoScore}/100
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {options.map((option) => (
              <TabsContent key={option.id} value={option.id} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">Title</p>
                        <Button size="sm" variant="outline" onClick={() => handleCopy(option.title)}>
                          Copy
                        </Button>
                      </div>
                      <Input value={option.title} readOnly className="bg-muted/40" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">Description</p>
                        <Button size="sm" variant="outline" onClick={() => handleCopy(option.description)}>
                          Copy
                        </Button>
                      </div>
                      <Textarea value={option.description} readOnly className="min-h-32 bg-muted/40" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">Tags</p>
                        <Button size="sm" variant="outline" onClick={() => handleCopy(option.tags.join(", "))}>
                          Copy
                        </Button>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/40 min-h-24 text-xs text-muted-foreground">
                        {option.tags.join(", ")}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">Hashtags</p>
                        <Button size="sm" variant="outline" onClick={() => handleCopy(option.hashtags.join(" "))}>
                          Copy
                        </Button>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/40 min-h-20 text-xs text-muted-foreground space-x-2">
                        {option.hashtags.join(" ")}
                      </div>
                    </div>
                    <Separator className="bg-border/60" />
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Launch plan:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Pin CTA comment referencing the {option.hook.toLowerCase()} giveaway.</li>
                        <li>Repurpose first 45 seconds into a Shorts teaser within 12 hours.</li>
                        <li>Schedule a community poll using the same keyword cluster.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/60" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/60">
                    <p className="text-xs text-muted-foreground uppercase">Projected Views</p>
                    <p className="text-lg font-semibold text-foreground">{formatNumber(option.estimatedMetrics.views)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/60">
                    <p className="text-xs text-muted-foreground uppercase">Projected Watch Time (mins)</p>
                    <p className="text-lg font-semibold text-foreground">{formatNumber(option.estimatedMetrics.watchTime)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/60">
                    <p className="text-xs text-muted-foreground uppercase">Engagement</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatNumber(option.estimatedMetrics.likes + option.estimatedMetrics.comments)} interactions
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/60">
                    <p className="text-xs text-muted-foreground uppercase">Share Velocity</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatNumber(option.estimatedMetrics.shares)} projected shares
                    </p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

