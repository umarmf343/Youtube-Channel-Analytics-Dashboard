"use client"

import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { User } from "@/lib/types"
import { fetchDailyVideoIdeas, type DailyVideoIdea } from "@/lib/youtube-api"

interface DailyIdeasProps {
  user: User
}

type FormatFilter = "all" | DailyVideoIdea["format"]
type SortOption = "impact" | "confidence" | "ctr"

const DEFAULT_FOCUS = "Creator growth"

function inferFocusFromUser(user: User): string {
  const source = `${user.channelName} ${user.description ?? ""}`.toLowerCase()
  const focusMap: Array<{ keywords: string[]; focus: string }> = [
    { keywords: ["ai", "tech", "automation", "code"], focus: "AI productivity" },
    { keywords: ["marketing", "brand", "business", "sales"], focus: "Creator marketing" },
    { keywords: ["fitness", "health", "wellness", "habit"], focus: "Wellness routines" },
    { keywords: ["finance", "money", "invest", "wealth"], focus: "Personal finance" },
  ]

  for (const entry of focusMap) {
    if (entry.keywords.some((keyword) => source.includes(keyword))) {
      return entry.focus
    }
  }

  return DEFAULT_FOCUS
}

function formatMinutes(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remaining = Math.round(minutes % 60)
    if (remaining === 0) {
      return `${hours}h`
    }
    return `${hours}h ${remaining}m`
  }

  return minutes % 1 === 0 ? `${minutes.toFixed(0)} min` : `${minutes.toFixed(1)} min`
}

export default function DailyIdeas({ user }: DailyIdeasProps) {
  const defaultFocus = useMemo(() => inferFocusFromUser(user), [user.channelName, user.description])
  const [ideas, setIdeas] = useState<DailyVideoIdea[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all")
  const [sortBy, setSortBy] = useState<SortOption>("impact")
  const [focusInput, setFocusInput] = useState(defaultFocus)
  const [appliedFocus, setAppliedFocus] = useState(defaultFocus)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    setFocusInput(defaultFocus)
    setAppliedFocus(defaultFocus)
  }, [defaultFocus])

  useEffect(() => {
    let isActive = true

    const loadIdeas = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchDailyVideoIdeas(user.channelId, {
          channelName: user.channelName,
          focus: appliedFocus,
        })
        if (!isActive) return
        setIdeas(data)
        setLastUpdated(new Date())
      } catch (err) {
        if (!isActive) return
        const message = err instanceof Error ? err.message : "Unable to load daily ideas"
        setError(message)
        setIdeas([])
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadIdeas()

    return () => {
      isActive = false
    }
  }, [user.channelId, user.channelName, appliedFocus])

  const filteredIdeas = useMemo(() => {
    const filtered = formatFilter === "all" ? ideas : ideas.filter((idea) => idea.format === formatFilter)

    return filtered.slice().sort((a, b) => {
      switch (sortBy) {
        case "confidence":
          return b.performance.confidence - a.performance.confidence
        case "ctr":
          return b.performance.expectedCtr - a.performance.expectedCtr
        default:
          return b.performance.expectedViews - a.performance.expectedViews
      }
    })
  }, [ideas, formatFilter, sortBy])

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">AI-Powered Daily Ideas</h1>
        <p className="text-muted-foreground">
          Fresh, personalized concepts to keep {user.channelName} publishing videos your audience will click today.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Personalize your ideas</CardTitle>
          <CardDescription>Fine-tune the focus to regenerate AI-crafted suggestions on demand.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-2">
              <Label htmlFor="focus">Channel or series focus</Label>
              <Input
                id="focus"
                value={focusInput}
                onChange={(event) => setFocusInput(event.target.value)}
                placeholder="e.g. AI productivity for busy founders"
              />
            </div>
            <div className="space-y-2">
              <Label>Format filter</Label>
              <ToggleGroup
                type="single"
                value={formatFilter}
                onValueChange={(value) => value && setFormatFilter(value as FormatFilter)}
                className="w-full"
              >
                <ToggleGroupItem value="all" className="text-sm">
                  All
                </ToggleGroupItem>
                <ToggleGroupItem value="Long-form" className="text-sm">
                  Long-form
                </ToggleGroupItem>
                <ToggleGroupItem value="Short" className="text-sm">
                  Shorts
                </ToggleGroupItem>
                <ToggleGroupItem value="Livestream" className="text-sm">
                  Live
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Label htmlFor="sort">Sort ideas by</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger id="sort" className="w-52">
                  <SelectValue placeholder="Highest predicted impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="impact">Highest predicted impact</SelectItem>
                  <SelectItem value="confidence">Confidence score</SelectItem>
                  <SelectItem value="ctr">Click-through rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
              <Button
                onClick={() => setAppliedFocus(focusInput.trim() || DEFAULT_FOCUS)}
                disabled={isLoading}
                className="min-w-[160px]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" /> Generating
                  </span>
                ) : (
                  "Generate new ideas"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      {isLoading && !ideas.length ? (
        <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
          <Spinner className="mr-2 h-5 w-5" />
          Fetching daily ideas…
        </div>
      ) : filteredIdeas.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-10 text-center text-muted-foreground">
            No ideas yet. Try broadening your focus and generating again.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {filteredIdeas.map((idea) => (
            <Card key={idea.id} className="border-border/50 transition-all hover:border-primary/40 hover:shadow-lg">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{idea.title}</CardTitle>
                    <CardDescription>{idea.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="uppercase">
                    {idea.format}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Hook:</span> {idea.hook}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Predicted views</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {idea.performance.expectedViews.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Expected reach if published this week</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Average watch time</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {formatMinutes(idea.performance.expectedWatchTimeMinutes)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {idea.format === "Livestream" ? "Estimated live retention" : "Projected audience retention"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Predicted CTR</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {idea.performance.expectedCtr.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Optimized packaging suggestion</p>
                  </div>
                  <div className="rounded-lg border border-border/40 bg-muted/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Confidence</p>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={idea.performance.confidence} className="h-2" />
                      <span className="text-sm font-medium text-foreground">
                        {idea.performance.confidence}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Signal strength from similar channels</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Why it works</p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {idea.supportingPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary/70" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-3 md:grid-cols-[1.2fr,1fr]">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Keyword stack</p>
                    <div className="flex flex-wrap gap-2">
                      {idea.keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="font-normal">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Tag & packaging cues</p>
                    <div className="flex flex-wrap gap-2">
                      {idea.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-border/40 bg-muted/30 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="font-medium text-foreground">AI insight:</span> {idea.aiInsights}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                  <span>Audience: {idea.audienceFocus}</span>
                  <span>Publish: {idea.publishWindow}</span>
                  <span>Primary keyword: {idea.primaryKeyword}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
