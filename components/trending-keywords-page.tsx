"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { fetchTrendingKeywords, calculateKeywordScore, type YouTubeKeywordData } from "@/lib/youtube-api"
import { Spinner } from "@/components/ui/spinner"

export default function TrendingKeywordsPage() {
  const [trendingByCategory, setTrendingByCategory] = useState<Record<string, YouTubeKeywordData[]>>({})
  const [selectedCategory, setSelectedCategory] = useState("technology")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState<YouTubeKeywordData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const categories = ["technology", "business", "lifestyle"]

  useEffect(() => {
    loadTrendingKeywords()
  }, [])

  const loadTrendingKeywords = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data: Record<string, YouTubeKeywordData[]> = {}
      for (const category of categories) {
        data[category] = await fetchTrendingKeywords(category)
      }
      setTrendingByCategory(data)
      if (data[selectedCategory]?.length > 0) {
        setSelectedKeyword(data[selectedCategory][0])
      }
    } catch (error) {
      console.error("[v0] Error loading trending keywords:", error)
      setError(error instanceof Error ? error.message : "Unable to load trending keywords")
      setTrendingByCategory({})
      setSelectedKeyword(null)
    } finally {
      setIsLoading(false)
    }
  }

  const currentTrending = trendingByCategory[selectedCategory] || []

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Trending Keywords</h1>
        <p className="text-muted-foreground">Discover what's trending across different categories</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs defaultValue="technology" onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="mr-2 h-6 w-6" />
                <span className="text-muted-foreground">Loading trending keywords...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trending List */}
                <div className="lg:col-span-1">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Top Trending</CardTitle>
                      <CardDescription>This week</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {currentTrending.map((keyword, idx) => (
                          <button
                            key={keyword.keyword}
                            onClick={() => setSelectedKeyword(keyword)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              selectedKeyword?.keyword === keyword.keyword
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-sm">{keyword.keyword}</p>
                                <p className="text-xs opacity-75">#{idx + 1} Trending</p>
                              </div>
                              <Badge variant="secondary" className="flex-shrink-0">
                                {keyword.trend}%
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Details */}
                {selectedKeyword && (
                  <div className="lg:col-span-2 space-y-4">
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle className="text-2xl">{selectedKeyword.keyword}</CardTitle>
                        <CardDescription>Detailed trending analysis</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            {
                              label: "Search Volume",
                              value: `${(selectedKeyword.searchVolume / 1000).toFixed(1)}K`,
                              gradient: "from-sky-500/20 via-sky-500/10 to-transparent",
                              text: "text-sky-600 dark:text-sky-400",
                            },
                            {
                              label: "Trend",
                              value: `${selectedKeyword.trend}%`,
                              gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
                              text: "text-amber-600 dark:text-amber-400",
                            },
                            {
                              label: "Competition",
                              value: `${selectedKeyword.competition}%`,
                              gradient: "from-rose-500/20 via-rose-500/10 to-transparent",
                              text: "text-rose-600 dark:text-rose-400",
                            },
                          ].map((metric) => (
                            <div
                              key={metric.label}
                              className={
                                "rounded-xl border border-border/50 bg-gradient-to-br p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg " +
                                metric.gradient
                              }
                            >
                              <p className="mb-1 text-sm text-muted-foreground">{metric.label}</p>
                              <p className={`text-2xl font-bold ${metric.text}`}>{metric.value}</p>
                            </div>
                          ))}
                          {(() => {
                            const score = calculateKeywordScore(selectedKeyword)
                            const scoreStyles = (() => {
                              if (score >= 85) {
                                return {
                                  gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
                                  text: "text-emerald-600 dark:text-emerald-400",
                                }
                              }
                              if (score >= 70) {
                                return {
                                  gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
                                  text: "text-amber-600 dark:text-amber-400",
                                }
                              }
                              return {
                                gradient: "from-rose-500/20 via-rose-500/10 to-transparent",
                                text: "text-rose-600 dark:text-rose-400",
                              }
                            })()

                            return (
                              <div
                                className={`rounded-xl border border-border/50 bg-gradient-to-br p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${scoreStyles.gradient}`}
                              >
                                <p className="mb-1 text-sm text-muted-foreground">Score</p>
                                <p className={`text-2xl font-bold ${scoreStyles.text}`}>{score}</p>
                              </div>
                            )
                          })()}
                        </div>

                        {/* Trend Chart */}
                        <div>
                          <h3 className="font-semibold text-foreground mb-4">12-Month Trend</h3>
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
                                data={selectedKeyword.monthlySearches.map((searches, i) => ({
                                  month: `M${i + 1}`,
                                  searches,
                                }))}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line
                                  type="monotone"
                                  dataKey="searches"
                                  stroke="var(--color-searches)"
                                  strokeWidth={2}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>

                        <Button className="w-full">Add to Campaign</Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
