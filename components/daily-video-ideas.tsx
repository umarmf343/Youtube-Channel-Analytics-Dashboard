"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import type { DailyVideoIdea, User } from "@/lib/types"
import { fetchDailyVideoIdeas } from "@/lib/youtube-api"

const NICHE_OPTIONS = [
  { value: "technology", label: "Technology & AI" },
  { value: "business", label: "Business & Marketing" },
  { value: "lifestyle", label: "Lifestyle & Wellness" },
]

const ENGAGEMENT_OPTIONS: Array<{ value: "low" | "medium" | "high"; label: string; description: string }> = [
  { value: "low", label: "Needs a boost", description: "Viewers are quieter than usual" },
  { value: "medium", label: "Steady", description: "Performance is on track" },
  { value: "high", label: "Highly engaged", description: "Audience responds to deeper dives" },
]

function inferNiche(user: User): string {
  const source = `${user.channelName} ${user.description ?? ""}`.toLowerCase()
  if (/(code|developer|tech|software|ai|programming|saas)/.test(source)) {
    return "technology"
  }
  if (/(business|marketing|startup|finance|entrepreneur|sales)/.test(source)) {
    return "business"
  }
  if (/(wellness|lifestyle|fitness|travel|food|beauty|fashion)/.test(source)) {
    return "lifestyle"
  }
  return "technology"
}

function formatUpdatedAt(date: Date | null) {
  if (!date) return ""
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

interface DailyVideoIdeasProps {
  user: User
}

export default function DailyVideoIdeas({ user }: DailyVideoIdeasProps) {
  const [ideas, setIdeas] = useState<DailyVideoIdea[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedNiche, setSelectedNiche] = useState<string>(() => inferNiche(user))
  const [engagementLevel, setEngagementLevel] = useState<"low" | "medium" | "high">("medium")

  const estimatedAverageViews = useMemo(() => {
    const safeSubscribers = Math.max(user.subscribers, 1)
    const ratio = user.totalViews / safeSubscribers
    if (!Number.isFinite(ratio)) {
      return undefined
    }
    const projection = Math.round(ratio * 120)
    return Math.min(75000, Math.max(1500, projection))
  }, [user.subscribers, user.totalViews])

  const topIdea = useMemo(() => {
    if (!ideas.length) return null
    return ideas.reduce((best, idea) => (idea.opportunityScore > best.opportunityScore ? idea : best), ideas[0])
  }, [ideas])

  const supportingIdeas = useMemo(() => {
    if (!topIdea) return ideas
    return ideas.filter((idea) => idea.id !== topIdea.id)
  }, [ideas, topIdea])

  const loadIdeas = useCallback(
    async (silent = false) => {
      if (silent) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      try {
        const response = await fetchDailyVideoIdeas({
          niche: selectedNiche,
          engagement: engagementLevel,
          channelId: user.channelId,
          channelName: user.channelName,
          subscribers: user.subscribers,
          averageViews: estimatedAverageViews,
        })
        setIdeas(response)
        setLastUpdated(new Date())
      } catch (err) {
        console.error("[DailyVideoIdeas] Unable to load ideas", err)
        setIdeas([])
        setError(err instanceof Error ? err.message : "Unable to load daily ideas")
      } finally {
        if (silent) {
          setIsRefreshing(false)
        } else {
          setIsLoading(false)
        }
      }
    },
    [selectedNiche, engagementLevel, user.channelId, user.channelName, user.subscribers, estimatedAverageViews],
  )

  useEffect(() => {
    loadIdeas()
  }, [loadIdeas])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Daily Video Ideas</h1>
          <p className="text-muted-foreground">
            Personalised prompts that remix your niche and audience engagement into ready-to-record concepts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span>
            Channel: <span className="font-medium text-foreground">{user.channelName}</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span>
            Subscribers: <span className="font-medium text-foreground">{user.subscribers.toLocaleString()}</span>
          </span>
          {lastUpdated ? (
            <>
              <span className="hidden sm:inline">•</span>
              <span>Updated {formatUpdatedAt(lastUpdated)}</span>
            </>
          ) : null}
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-4 md:grid-cols-3 md:items-end">
            <div className="space-y-2">
              <Label htmlFor="niche-select">Channel niche</Label>
              <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                <SelectTrigger id="niche-select" className="capitalize">
                  <SelectValue placeholder="Choose niche" />
                </SelectTrigger>
                <SelectContent>
                  {NICHE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="capitalize">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Adjust the niche to experiment with tangential audiences and micro-topics.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="engagement-select">Audience engagement</Label>
              <Select value={engagementLevel} onValueChange={(value: "low" | "medium" | "high") => setEngagementLevel(value)}>
                <SelectTrigger id="engagement-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENGAGEMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Tell the AI how engaged your last few uploads were to refine the hooks and pacing.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <div className="text-sm text-muted-foreground">
                {estimatedAverageViews ? (
                  <span>
                    Estimated average views <span className="font-medium text-foreground">{estimatedAverageViews.toLocaleString()}</span>
                  </span>
                ) : (
                  <span>Estimated average views calibrate automatically.</span>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => loadIdeas(true)}
                disabled={isLoading || isRefreshing}
                className="gap-2"
              >
                {isRefreshing ? <Spinner className="h-4 w-4" /> : null}
                Refresh ideas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/60 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60">
          <Spinner className="h-6 w-6" />
          <p className="text-sm text-muted-foreground">Generating personalised prompts...</p>
        </div>
      ) : !ideas.length ? (
        <div className="rounded-lg border border-border/60 p-6 text-center text-muted-foreground">
          Adjust the filters above to receive fresh AI-powered concepts tailored to your channel.
        </div>
      ) : (
        <div className="space-y-6">
          {topIdea ? (
            <Card className="border-primary/40 bg-primary/5 shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{topIdea.title}</CardTitle>
                    <CardDescription>{topIdea.summary}</CardDescription>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {topIdea.format}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {topIdea.trendType}
                      </Badge>
                      <Badge variant="outline">{topIdea.recommendedLength}</Badge>
                    </div>
                  </div>
                  <Badge className="text-base" variant="default">
                    Opportunity {topIdea.opportunityScore}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Opportunity</span>
                    <span className="text-lg font-semibold text-foreground">{topIdea.opportunityScore}/100</span>
                    <Progress value={topIdea.opportunityScore} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Audience match</span>
                    <span className="text-lg font-semibold text-foreground">{topIdea.audienceMatch}/100</span>
                    <Progress value={topIdea.audienceMatch} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Predicted views</span>
                    <span className="text-lg font-semibold text-foreground">{topIdea.predictedViews.toLocaleString()}</span>
                    <p className="text-xs text-muted-foreground">Based on channel size & engagement blend.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border/60 bg-background/60 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hook</p>
                    <p className="text-sm leading-relaxed text-foreground">{topIdea.hook}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/60 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Engagement angle</p>
                    <p className="text-sm leading-relaxed text-foreground">{topIdea.engagementAngle}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border/60 bg-background/60 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Call to action</p>
                    <p className="text-sm leading-relaxed text-foreground">{topIdea.callToAction}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/60 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why it works</p>
                    <p className="text-sm leading-relaxed text-foreground">{topIdea.reason}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {topIdea.tags.map((tag) => (
                    <Badge key={`${topIdea.id}-${tag}`} variant="outline" className="text-xs font-medium">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {supportingIdeas.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {supportingIdeas.map((idea) => (
                <Card key={idea.id} className="border-border/60">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">{idea.title}</CardTitle>
                        <CardDescription>{idea.summary}</CardDescription>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {idea.format}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {idea.trendType}
                          </Badge>
                          <Badge variant="outline">{idea.recommendedLength}</Badge>
                        </div>
                      </div>
                      <Badge variant="outline">Score {idea.opportunityScore}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Audience match</span>
                        <span className="text-base font-semibold text-foreground">{idea.audienceMatch}/100</span>
                        <Progress value={idea.audienceMatch} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Predicted views</span>
                        <span className="text-base font-semibold text-foreground">{idea.predictedViews.toLocaleString()}</span>
                        <p className="text-xs text-muted-foreground">Tuned to your engagement selection.</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hook</p>
                        <p className="text-sm text-foreground">{idea.hook}</p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Engagement angle</p>
                        <p className="text-sm text-foreground">{idea.engagementAngle}</p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-background/60 p-3 sm:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Call to action</p>
                        <p className="text-sm text-foreground">{idea.callToAction}</p>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-muted-foreground">{idea.reason}</p>

                    <div className="flex flex-wrap gap-2">
                      {idea.tags.map((tag) => (
                        <Badge key={`${idea.id}-${tag}`} variant="outline" className="text-xs font-medium">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
