"use client"

import type React from "react"

import { useId, useState } from "react"
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

export default function RealTimeKeywordResearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [keywordData, setKeywordData] = useState<YouTubeKeywordData | null>(null)
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([])
  const [trendingKeywords, setTrendingKeywords] = useState<YouTubeKeywordData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("technology")
  const [keywordScore, setKeywordScore] = useState(0)
  const [performance, setPerformance] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const gradientId = useId()
  const searchTrendGradientId = `search-trend-${gradientId.replace(/:/g, "")}`

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
                {["technology", "business", "lifestyle"].map((cat) => (
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
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Keyword Analysis Guide</CardTitle>
              <CardDescription>Understanding the metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Search Volume</h4>
                  <p className="text-sm text-muted-foreground">
                    Average monthly searches for this keyword. Higher volume = more potential traffic.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Competition</h4>
                  <p className="text-sm text-muted-foreground">
                    How many creators are targeting this keyword. Lower competition = easier to rank.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Trend</h4>
                  <p className="text-sm text-muted-foreground">
                    Whether the keyword is rising or falling in popularity. Higher trend = growing interest.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Keyword Score</h4>
                  <p className="text-sm text-muted-foreground">
                    Overall opportunity score (0-100). Combines volume, competition, and trend data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
