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
import {
  fetchYouTubeKeywordData,
  fetchRelatedKeywords,
  fetchTrendingKeywords,
  calculateKeywordScore,
  predictVideoPerformance,
  type YouTubeKeywordData,
} from "@/lib/youtube-api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table"

export default function RealTimeKeywordResearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [keywordData, setKeywordData] = useState<YouTubeKeywordData | null>(null)
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([])
  const [trendingKeywords, setTrendingKeywords] = useState<YouTubeKeywordData[]>([])
  const [isKeywordLoading, setIsKeywordLoading] = useState(false)
  const [isTrendingLoading, setIsTrendingLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("technology")
  const [keywordScore, setKeywordScore] = useState(0)
  const [performance, setPerformance] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("search")
  const [analysisHistory, setAnalysisHistory] = useState<YouTubeKeywordData[]>([])
  const gradientId = useId()
  const searchTrendGradientId = `search-trend-${gradientId.replace(/:/g, "")}`

  const combinedRelatedKeywords = useMemo(() => {
    const apiRelated = keywordData?.relatedKeywords ?? []
    const supplemental = relatedKeywords.filter((keyword) => !apiRelated.includes(keyword))
    return [...apiRelated, ...supplemental]
  }, [keywordData, relatedKeywords])

  const relatedKeywordInsights = useMemo(() => {
    if (!keywordData) return []

    const baseVolume = keywordData.searchVolume
    const baseCompetition = keywordData.competition

    return combinedRelatedKeywords.slice(0, 8).map((keyword, index) => {
      const volume = Math.max(Math.round(baseVolume * (0.82 - index * 0.08)), 1200)
      const competition = Math.min(Math.max(Math.round(baseCompetition + index * 4 - 6), 8), 95)
      const score = Math.max(Math.min(keywordScore - index * 5 + 10, 100), 25)

      return {
        keyword,
        score,
        volume,
        competition,
      }
    })
  }, [combinedRelatedKeywords, keywordData, keywordScore])

  const loadKeywordDetails = async (term: string) => {
    const normalizedTerm = term.trim()
    if (!normalizedTerm) {
      return
    }

    setIsKeywordLoading(true)
    setError(null)

    try {
      const data = await fetchYouTubeKeywordData(normalizedTerm)
      setKeywordData(data)
      setSearchTerm(data.keyword)

      const score = calculateKeywordScore(data)
      setKeywordScore(score)

      const estimatedChannelSize = data.searchVolume > 60000 ? "large" : data.searchVolume > 25000 ? "medium" : "small"
      const perf = predictVideoPerformance(score, estimatedChannelSize)
      setPerformance(perf)

      const supplementalRelated = await fetchRelatedKeywords(normalizedTerm)
      const mergedRelated = Array.from(
        new Set([...(data.relatedKeywords ?? []), ...supplementalRelated.map((keyword) => keyword.trim())]),
      ).filter(Boolean)
      setRelatedKeywords(mergedRelated)

      setAnalysisHistory((previous) => {
        const filtered = previous.filter((item) => item.keyword.toLowerCase() !== data.keyword.toLowerCase())
        return [data, ...filtered].slice(0, 8)
      })

      setActiveTab("analysis")
    } catch (error) {
      console.error("[v0] Error fetching keyword data:", error)
      setError(error instanceof Error ? error.message : "Unable to fetch keyword data")
      setKeywordData(null)
      setRelatedKeywords([])
      setPerformance(null)
    } finally {
      setIsKeywordLoading(false)
    }
  }

  const handleKeywordSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const term = searchTerm.trim()
    if (!term) return

    await loadKeywordDetails(term)
  }

  const handleFetchTrending = async () => {
    setIsTrendingLoading(true)
    setError(null)
    try {
      const trending = await fetchTrendingKeywords(selectedCategory)
      setTrendingKeywords(trending)
    } catch (error) {
      console.error("[v0] Error fetching trending keywords:", error)
      setError(error instanceof Error ? error.message : "Unable to load trending keywords")
      setTrendingKeywords([])
    } finally {
      setIsTrendingLoading(false)
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

  const analyzeButtonClasses =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 w-full mt-4 bg-transparent"

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                <Button type="submit" disabled={isKeywordLoading}>
                  {isKeywordLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
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
                          onClick={() => {
                            void loadKeywordDetails(keyword)
                          }}
                          className="w-full text-left p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm text-foreground"
                          disabled={isKeywordLoading}
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
              <Button onClick={handleFetchTrending} disabled={isTrendingLoading} className="w-full">
                {isTrendingLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
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
                      className={analyzeButtonClasses}
                      onClick={() => {
                        void loadKeywordDetails(keyword.keyword)
                      }}
                      disabled={isKeywordLoading}
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
          {isKeywordLoading ? (
            <Card className="border-border/50">
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Spinner className="h-5 w-5" />
                  <p>Generating real-time analysis…</p>
                </div>
              </CardContent>
            </Card>
          ) : keywordData ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardDescription>Search Volume</CardDescription>
                    <CardTitle className="text-2xl">{(keywordData.searchVolume / 1000).toFixed(1)}K</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-border/50">
                  <CardHeader>
                    <CardDescription>Competition</CardDescription>
                    <CardTitle className="text-2xl">{keywordData.competition}%</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-border/50">
                  <CardHeader>
                    <CardDescription>Trend Velocity</CardDescription>
                    <CardTitle className="text-2xl">{keywordData.trend}%</CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-border/50">
                  <CardHeader>
                    <CardDescription>Avg. CPC</CardDescription>
                    <CardTitle className="text-2xl">${keywordData.cpc.toFixed(2)}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="border-border/50 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-xl">12-Month Search Trend</CardTitle>
                    <CardDescription>Live trendline from YouTube analytics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        searches: {
                          label: "Monthly Searches",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-72"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={keywordData.monthlySearches.map((searches, index) => ({
                            month: `M${index + 1}`,
                            searches,
                          }))}
                        >
                          <defs>
                            <linearGradient id={searchTrendGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
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
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl">Optimization Insights</CardTitle>
                    <CardDescription>Suggested next steps for {keywordData.keyword}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="rounded-lg border border-border/50 bg-muted/40 p-3">
                      <p className="font-medium text-foreground">Thumbnail Hook</p>
                      <p className="text-muted-foreground">
                        Highlight the {keywordData.trend}% growth with a bold trendline graphic to boost CTR.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-muted/40 p-3">
                      <p className="font-medium text-foreground">Content Angle</p>
                      <p className="text-muted-foreground">
                        Position the video for creators searching for actionable tactics with mid-level competition.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-muted/40 p-3">
                      <p className="font-medium text-foreground">Call-to-Action</p>
                      <p className="text-muted-foreground">
                        Use card annotations at the 60 second mark to promote related videos targeting the same niche.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Related Keyword Opportunities</CardTitle>
                    <CardDescription>Prioritize keywords that share the same viewer intent.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relatedKeywordInsights.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Keyword</TableHead>
                            <TableHead className="text-right">Opportunity</TableHead>
                            <TableHead className="text-right">Est. Volume</TableHead>
                            <TableHead className="text-right">Competition</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {relatedKeywordInsights.map((keyword) => (
                            <TableRow key={keyword.keyword}>
                              <TableCell className="max-w-[220px] truncate text-foreground">{keyword.keyword}</TableCell>
                              <TableCell className="text-right font-medium">{keyword.score}</TableCell>
                              <TableCell className="text-right">{(keyword.volume / 1000).toFixed(1)}K</TableCell>
                              <TableCell className="text-right">{keyword.competition}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground">No related keyword insights yet.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Recent Analyses</CardTitle>
                    <CardDescription>Your latest keyword lookups are saved for quick reference.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysisHistory.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Keyword</TableHead>
                            <TableHead className="text-right">Volume</TableHead>
                            <TableHead className="text-right">Competition</TableHead>
                            <TableHead className="text-right">Trend</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysisHistory.map((entry) => (
                            <TableRow key={entry.keyword}>
                              <TableCell className="text-foreground">{entry.keyword}</TableCell>
                              <TableCell className="text-right">{(entry.searchVolume / 1000).toFixed(1)}K</TableCell>
                              <TableCell className="text-right">{entry.competition}%</TableCell>
                              <TableCell className="text-right">{entry.trend}%</TableCell>
                              <TableCell className="text-right">{calculateKeywordScore(entry)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableCaption>Last {analysisHistory.length} keyword analyses</TableCaption>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground">Search for a keyword to populate your analysis history.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Run a keyword analysis</CardTitle>
                <CardDescription>
                  Start from the search or trending tabs to populate this workspace with live metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => setActiveTab("search")}>
                  Go to keyword search
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
