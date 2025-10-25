"use client"

import type React from "react"

import { useId, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { formatNumber } from "@/lib/utils"
import {
  fetchYouTubeKeywordData,
  fetchRelatedKeywords,
  fetchTrendingKeywords,
  calculateKeywordScore,
  predictVideoPerformance,
  type YouTubeKeywordData,
} from "@/lib/youtube-api"

export default function RealTimeKeywordResearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [keywordData, setKeywordData] = useState<YouTubeKeywordData | null>(null)
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([])
  const [trendingKeywords, setTrendingKeywords] = useState<YouTubeKeywordData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("technology")
  const [keywordScore, setKeywordScore] = useState(0)
  const [performance, setPerformance] = useState<ReturnType<typeof predictVideoPerformance> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const gradientId = useId()
  const searchTrendGradientId = `search-trend-${gradientId.replace(/:/g, "")}`
  const analysisTrendGradientId = `analysis-trend-${gradientId.replace(/:/g, "")}`

  const handleKeywordSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchYouTubeKeywordData(searchTerm)
      setKeywordData(data)

      const score = calculateKeywordScore(data)
      setKeywordScore(score)

      const perf = predictVideoPerformance(score, "medium")
      setPerformance(perf)

      const related = await fetchRelatedKeywords(searchTerm)
      setRelatedKeywords(related)
    } catch (error) {
      console.error("[v0] Error fetching keyword data:", error)
      setError(error instanceof Error ? error.message : "Unable to fetch keyword data")
      setKeywordData(null)
      setRelatedKeywords([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFetchTrending = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const trending = await fetchTrendingKeywords(selectedCategory)
      setTrendingKeywords(trending)
    } catch (error) {
      console.error("[v0] Error fetching trending keywords:", error)
      setError(error instanceof Error ? error.message : "Unable to load trending keywords")
      setTrendingKeywords([])
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "Easy") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
    if (difficulty === "Medium") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 dark:text-green-400"
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const analysisDetails = useMemo(() => {
    if (!keywordData) return null

    const sanitizedTrend = Math.round(keywordData.trend)
    const volumeScore = Math.min(Math.round((keywordData.searchVolume / 50000) * 100), 100)
    const competitionScore = Math.max(100 - keywordData.competition, 0)
    const momentumScore = Math.min(Math.max(sanitizedTrend, 0), 100)

    const stage =
      sanitizedTrend >= 70 ? "Breakout" : sanitizedTrend >= 40 ? "Rising" : sanitizedTrend >= 10 ? "Steady" : "Cooling"

    const stageDescription =
      stage === "Breakout"
        ? "Search demand is surging. Publish while the algorithm is rewarding early coverage."
        : stage === "Rising"
          ? "Momentum is building. An early, authoritative video will capture the influx of searches."
          : stage === "Steady"
            ? "Demand is consistent. A definitive guide can secure evergreen search traffic."
            : "Interest is softening. Refresh the angle or pair with related trends to reignite attention."

    const opportunityLevel = keywordScore >= 85 ? "High priority" : keywordScore >= 70 ? "Worth pursuing" : "Supportive angle"

    const lengthRange =
      keywordScore >= 85 ? { min: 9, max: 11 } : keywordScore >= 70 ? { min: 7, max: 9 } : { min: 5, max: 7 }
    const recommendedLengthLabel = `${lengthRange.min}-${lengthRange.max} minutes`

    const cadenceAction =
      stage === "Breakout"
        ? "Publish within the next 48 hours while searches are spiking."
        : stage === "Rising"
          ? "Schedule this upload within the next 5 days to ride the upswing."
          : stage === "Steady"
            ? "Slot this into next week's release cadence to keep steady discovery traffic."
            : "Monitor the trend weekly and refresh your hook when searches rebound."

    const monetizationNote =
      keywordData.cpc >= 3
        ? "Advertisers pay a premium here—highlight sponsorships or high-value affiliate offers."
        : keywordData.cpc >= 2
          ? "CPMs are healthy; weave in mid-roll ads and product mentions to maximize revenue."
          : "Treat this topic as top-of-funnel and push viewers to higher-value playlists or email capture."

    const differentiationAction =
      keywordData.competition >= 65
        ? "Include proprietary data or a case study to stand out from look-alike tutorials."
        : keywordData.competition >= 45
          ? "Blend a how-to walkthrough with storytelling to edge past templated guides."
          : "Position this as the definitive guide and dominate search placements."

    const primaryPromise =
      stage === "Breakout"
        ? `Show how to win with ${keywordData.keyword} before everyone else catches up.`
        : stage === "Rising"
          ? `Give viewers a repeatable system for ${keywordData.keyword} they can deploy today.`
          : stage === "Steady"
            ? `Save viewers hours by packaging everything they need to know about ${keywordData.keyword}.`
            : `Update ${keywordData.keyword} with a unique POV to revive audience interest.`

    const tagCandidates = relatedKeywords.length ? relatedKeywords : keywordData.relatedKeywords
    const fallbackTags = [
      keywordData.keyword,
      `${keywordData.keyword} tutorial`,
      `${keywordData.keyword} tips`,
      `${keywordData.keyword} strategy`,
    ]
    const tagSet = new Set<string>()
    const tags: string[] = []
    ;[...tagCandidates, ...fallbackTags].forEach((tag) => {
      const normalized = tag.trim()
      if (!normalized) return
      const key = normalized.toLowerCase()
      if (tagSet.has(key)) return
      tagSet.add(key)
      tags.push(normalized)
    })
    const metadataTags = tags.slice(0, 8)

    const year = new Date().getFullYear()
    const metadataTitle = `${keywordData.keyword} (${year} Step-by-Step Guide)`
    const metadataDescription = `Learn the exact framework I use for ${keywordData.keyword} so you can skip the guesswork, follow a proven checklist, and get results faster.`
    const metadataCTA =
      stage === "Breakout"
        ? "Ask viewers to subscribe for weekly trend breakdowns while the topic is hot."
        : stage === "Rising"
          ? "Drive viewers to download your companion resource so they can implement immediately."
          : stage === "Steady"
            ? "Promote your evergreen playlist or course as the natural next step."
            : "Invite comments with fresh questions you can answer in a follow-up video."

    const outline = [
      {
        title: "Hook (0:00-0:20)",
        detail: `Promise the outcome viewers get when they master ${keywordData.keyword}.`,
      },
      {
        title: "Context (0:20-1:00)",
        detail: `Explain why ${keywordData.keyword} matters right now and what changed in the landscape.`,
      },
      {
        title: "Framework (1:00-4:00)",
        detail: `Break down the core steps or pillars that make ${keywordData.keyword} work consistently.`,
      },
      {
        title: "Proof & Examples (4:00-6:00)",
        detail: `Show real workflows, analytics, or before/after wins tied to ${keywordData.keyword}.`,
      },
      {
        title: "Implementation (6:00-8:00)",
        detail: `Give viewers an actionable checklist or template they can copy immediately.`,
      },
      {
        title: "CTA & Next Step (8:00-${lengthRange.max.toString().padStart(2, "0")}:00)",
        detail: `Send viewers to the resource or playlist that deepens their journey beyond this video.`,
      },
    ]

    const monthlySearches = keywordData.monthlySearches
    const latest = monthlySearches[monthlySearches.length - 1] ?? 0
    const previous = monthlySearches[monthlySearches.length - 2] ?? latest
    const monthOverMonth = previous > 0 ? Math.round(((latest - previous) / previous) * 100) : 0
    const peak = monthlySearches.length ? Math.max(...monthlySearches) : latest
    const peakRelative = peak > 0 ? Math.round((latest / peak) * 100) : 100
    const trendNarrative = monthOverMonth >= 0
      ? `Up ${monthOverMonth}% vs last month and holding ${peakRelative}% of this year's peak interest.`
      : `Down ${Math.abs(monthOverMonth)}% vs last month but still at ${peakRelative}% of the annual peak.`

    const factorScores = [
      {
        label: "Demand",
        value: volumeScore,
        helper: `${(keywordData.searchVolume / 1000).toFixed(1)}K monthly searches`,
      },
      {
        label: "Competition headroom",
        value: competitionScore,
        helper: `${keywordData.competition}% saturation (higher score = easier to rank)`,
      },
      {
        label: "Momentum",
        value: momentumScore,
        helper:
          sanitizedTrend >= 0
            ? `${sanitizedTrend}% growth over baseline interest`
            : `${Math.abs(sanitizedTrend)}% decline from peak interest`,
      },
      {
        label: "Opportunity score",
        value: keywordScore,
        helper: "Blended score weighting demand, competition, and momentum",
      },
    ]

    const checklist = [
      cadenceAction,
      `Storyboard the intro around this promise: ${primaryPromise}`,
      differentiationAction,
      `Work these supporting keywords into your description and tags: ${metadataTags.slice(0, 4).join(", ")}.`,
      monetizationNote,
    ]

    const chartData = monthlySearches.map((value, index) => ({
      month: `M${index + 1}`,
      searches: value,
    }))

    return {
      stage,
      stageDescription,
      opportunityLevel,
      recommendedLengthLabel,
      cadenceAction,
      monetizationNote,
      differentiationAction,
      factorScores,
      chartData,
      trendNarrative,
      outline,
      metadata: {
        title: metadataTitle,
        description: metadataDescription,
        cta: metadataCTA,
        tags: metadataTags,
      },
      checklist,
    }
  }, [keywordData, keywordScore, relatedKeywords])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Real-Time Keyword Research</h1>
        <p className="text-muted-foreground">Powered by YouTube API integration for live keyword data</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Keyword Search</TabsTrigger>
          <TabsTrigger value="trending">Trending Keywords</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        {/* Keyword Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Search Keywords</CardTitle>
              <CardDescription>Enter a keyword to get real-time YouTube data</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleKeywordSearch} className="flex gap-2">
                <Input
                  placeholder="e.g., react hooks tutorial, nextjs seo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {keywordData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Metrics */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-2xl">{keywordData.keyword}</CardTitle>
                    <CardDescription>Comprehensive keyword analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">Search Volume</p>
                        <p className="text-2xl font-bold text-foreground">
                          {(keywordData.searchVolume / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">Competition</p>
                        <p className="text-2xl font-bold text-foreground">{keywordData.competition}%</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">Trend</p>
                        <p className="text-2xl font-bold text-foreground">{keywordData.trend}%</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">Keyword Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(keywordScore)}`}>{keywordScore}</p>
                      </div>
                    </div>

                    {/* Monthly Trend Chart */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">12-Month Search Trend</h3>
                      <ChartContainer
                        config={{
                          searches: {
                            label: "Monthly Searches",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                        className="h-64"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={keywordData.monthlySearches.map((searches, i) => ({
                              month: `M${i + 1}`,
                              searches,
                            }))}
                          >
                            <defs>
                              <linearGradient
                                id={searchTrendGradientId}
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="hsl(var(--chart-1))" />
                                <stop offset="50%" stopColor="hsl(var(--chart-2))" />
                                <stop offset="100%" stopColor="hsl(var(--chart-3))" />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                              type="monotone"
                              dataKey="searches"
                              stroke={`url(#${searchTrendGradientId})`}
                              strokeWidth={2}
                              dot={{
                                r: 4,
                                stroke: `url(#${searchTrendGradientId})`,
                                strokeWidth: 2,
                                fill: "var(--background)",
                              }}
                              activeDot={{
                                r: 6,
                                strokeWidth: 0,
                                fill: `url(#${searchTrendGradientId})`,
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium text-foreground">Difficulty Level</span>
                      <Badge className={getDifficultyColor(keywordData.difficulty)}>{keywordData.difficulty}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Prediction */}
              <div className="space-y-4">
                <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Prediction</CardTitle>
                    <CardDescription>Based on keyword metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {performance && (
                      <>
                        <div className="p-3 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground mb-1">Est. Views</p>
                          <p className="text-xl font-bold text-foreground">
                            {(performance.estimatedViews / 1000).toFixed(0)}K
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground mb-1">Est. Engagement</p>
                          <p className="text-xl font-bold text-foreground">
                            {(performance.estimatedEngagement / 1000).toFixed(1)}K
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground mb-1">Est. CTR</p>
                          <p className="text-xl font-bold text-foreground">{performance.estimatedCTR}%</p>
                        </div>
                      </>
                    )}
                    <Button className="w-full mt-4">Add to Campaign</Button>
                  </CardContent>
                </Card>

                {/* Related Keywords */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Related Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {relatedKeywords.map((keyword) => (
                        <button
                          key={keyword}
                          onClick={() => setSearchTerm(keyword)}
                          className="w-full text-left p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm text-foreground"
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Trending Keywords Tab */}
        <TabsContent value="trending" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Trending Keywords by Category</CardTitle>
              <CardDescription>Discover what's trending in your niche</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {[
                  "technology",
                  "business",
                  "lifestyle",
                  "finance",
                  "health",
                  "education",
                  "gaming",
                  "entertainment",
                  "news",
                  "sports",
                  "travel",
                  "food",
                  "music",
                ].map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                    className="capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              <Button onClick={handleFetchTrending} disabled={isLoading} className="w-full">
                {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Fetch Trending Keywords
              </Button>
            </CardContent>
          </Card>

          {trendingKeywords.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingKeywords.map((keyword) => (
                <Card key={keyword.keyword} className="border-border/50">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-foreground mb-3">{keyword.keyword}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Search Volume:</span>
                        <span className="font-medium text-foreground">{(keyword.searchVolume / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Competition:</span>
                        <span className="font-medium text-foreground">{keyword.competition}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trend:</span>
                        <span className="font-medium text-foreground">{keyword.trend}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Score:</span>
                        <span className={`font-medium ${getScoreColor(calculateKeywordScore(keyword))}`}>
                          {calculateKeywordScore(keyword)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4 bg-transparent"
                      onClick={() => setSearchTerm(keyword.keyword)}
                    >
                      Analyze
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {!analysisDetails ? (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Keyword Analysis</CardTitle>
                <CardDescription>Run a keyword search to unlock tailored guidance.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enter a keyword above to generate an actionable breakdown covering opportunity scores, content
                  structure, and metadata suggestions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <Card className="border-border/50 xl:col-span-2">
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="uppercase tracking-wide">
                        {analysisDetails.opportunityLevel}
                      </Badge>
                      <Badge variant="outline">Stage: {analysisDetails.stage}</Badge>
                      <Badge variant="outline">Difficulty: {keywordData?.difficulty}</Badge>
                    </div>
                    <CardTitle className="text-2xl">Opportunity snapshot</CardTitle>
                    <CardDescription>{analysisDetails.stageDescription}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      {analysisDetails.factorScores.map((factor) => (
                        <div key={factor.label} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{factor.label}</span>
                            <span className="font-medium text-foreground">{factor.value}</span>
                          </div>
                          <Progress value={factor.value} className="h-2" />
                          {factor.helper ? (
                            <p className="text-xs text-muted-foreground">{factor.helper}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Momentum over the last 12 months</h4>
                      <ChartContainer
                        config={{
                          searches: {
                            label: "Monthly searches",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                        className="h-56"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analysisDetails.chartData}>
                            <defs>
                              <linearGradient
                                id={analysisTrendGradientId}
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="hsl(var(--chart-1))" />
                                <stop offset="50%" stopColor="hsl(var(--chart-2))" />
                                <stop offset="100%" stopColor="hsl(var(--chart-3))" />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                              type="monotone"
                              dataKey="searches"
                              stroke={`url(#${analysisTrendGradientId})`}
                              strokeWidth={2}
                              dot={{
                                r: 3,
                                stroke: `url(#${analysisTrendGradientId})`,
                                strokeWidth: 2,
                                fill: "var(--background)",
                              }}
                              activeDot={{
                                r: 5,
                                strokeWidth: 0,
                                fill: `url(#${analysisTrendGradientId})`,
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      <p className="mt-2 text-xs text-muted-foreground">{analysisDetails.trendNarrative}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Performance forecast</CardTitle>
                    <CardDescription>Modeled for a medium-sized channel</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {performance ? (
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-muted/40 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Est. Views</p>
                          <p className="text-lg font-semibold text-foreground">
                            {formatNumber(performance.estimatedViews)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Est. Engagement</p>
                          <p className="text-lg font-semibold text-foreground">
                            {formatNumber(performance.estimatedEngagement)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Est. CTR</p>
                          <p className="text-lg font-semibold text-foreground">
                            {performance.estimatedCTR}%
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Search for a keyword first to model expected performance for your channel size.
                      </p>
                    )}

                    <Separator />

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">Recommended length: </span>
                        {analysisDetails.recommendedLengthLabel}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Launch timing: </span>
                        {analysisDetails.cadenceAction}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Monetization focus: </span>
                        {analysisDetails.monetizationNote}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Content blueprint</CardTitle>
                    <CardDescription>Structure the video to earn retention</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {analysisDetails.outline.map((item) => (
                        <div key={item.title} className="rounded-lg border border-border/40 p-3">
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{analysisDetails.differentiationAction}</p>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Metadata &amp; SEO assets</CardTitle>
                    <CardDescription>Copy and adapt to your voice</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Suggested title</p>
                      <p className="font-medium text-foreground">{analysisDetails.metadata.title}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Description hook</p>
                      <p className="text-sm text-muted-foreground">{analysisDetails.metadata.description}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Primary CTA</p>
                      <p className="text-sm text-muted-foreground">{analysisDetails.metadata.cta}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {analysisDetails.metadata.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs capitalize">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Action checklist</CardTitle>
                  <CardDescription>Final prep before you hit publish</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisDetails.checklist.map((action, index) => (
                    <div key={`${action}-${index}`} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-primary" aria-hidden />
                      <p className="text-sm text-muted-foreground">{action}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
