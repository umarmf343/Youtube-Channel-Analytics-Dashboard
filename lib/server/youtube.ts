import type {
  RealTimeStatsPayload,
  RealTimeStatsPoint,
  RealTimeStatsSummary,
  TrendAlert,
  User,
  Video,
} from "@/lib/types"
import type { YouTubeKeywordData } from "@/lib/youtube-api"
import { calculateDifficulty, calculateKeywordScore } from "@/lib/youtube-api"

const API_BASE_URL = "https://www.googleapis.com/youtube/v3"
const API_KEY = process.env.YOUTUBE_API_KEY

export class MissingYouTubeApiKeyError extends Error {
  constructor() {
    super("YOUTUBE_API_KEY is not configured")
    this.name = "MissingYouTubeApiKeyError"
  }
}

export class YouTubeQuotaExceededError extends Error {
  constructor(message = "YouTube API quota exceeded") {
    super(message)
    this.name = "YouTubeQuotaExceededError"
  }
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "with",
  "from",
  "your",
  "that",
  "this",
  "into",
  "what",
  "when",
  "how",
  "tips",
  "2024",
  "2025",
  "guide",
  "tutorial",
  "best",
  "free",
  "full",
  "step",
  "learn",
])

type SearchListResponse = {
  items: Array<{
    id?: { videoId?: string; channelId?: string }
    snippet?: {
      publishedAt?: string
      title?: string
      description?: string
      channelId?: string
      thumbnails?: {
        default?: { url?: string }
        medium?: { url?: string }
      }
    }
  }>
  pageInfo?: { totalResults?: number }
}

type VideosListResponse = {
  items: Array<{
    id?: string
    snippet?: {
      publishedAt?: string
      title?: string
      description?: string
      tags?: string[]
      thumbnails?: {
        default?: { url?: string }
        medium?: { url?: string }
      }
    }
    statistics?: {
      viewCount?: string
      likeCount?: string
      commentCount?: string
    }
    contentDetails?: {
      duration?: string
    }
  }>
}

type ChannelsListResponse = {
  items: Array<{
    id?: string
    snippet?: {
      title?: string
      description?: string
      publishedAt?: string
      thumbnails?: {
        default?: { url?: string }
      }
    }
    statistics?: {
      viewCount?: string
      subscriberCount?: string
    }
  }>
}

function requireApiKey() {
  if (!API_KEY) {
    throw new MissingYouTubeApiKeyError()
  }
}

async function callYouTubeApi<T>(endpoint: string, params: Record<string, string | number | undefined>): Promise<T> {
  requireApiKey()

  const url = new URL(`${API_BASE_URL}/${endpoint}`)

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  }

  url.searchParams.set("key", API_KEY as string)

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  if (!response.ok) {
    const rawBody = await response.text()
    let parsed: unknown
    let message = rawBody

    try {
      parsed = JSON.parse(rawBody)
      if (
        parsed &&
        typeof parsed === "object" &&
        "error" in parsed &&
        parsed.error &&
        typeof parsed.error === "object" &&
        parsed.error !== null &&
        "message" in parsed.error &&
        typeof parsed.error.message === "string"
      ) {
        message = parsed.error.message
      }
    } catch (error) {
      // rawBody is not JSON – keep the original text message
      parsed = undefined
    }

    const quotaExceeded = (() => {
      if (response.status !== 403) return false

      if (typeof message === "string" && /quota/i.test(message)) {
        return true
      }

      if (
        parsed &&
        typeof parsed === "object" &&
        "error" in parsed &&
        parsed.error &&
        typeof parsed.error === "object" &&
        parsed.error !== null &&
        "errors" in parsed.error &&
        Array.isArray(parsed.error.errors)
      ) {
        return parsed.error.errors.some((item) => {
          return Boolean(item && typeof item === "object" && "reason" in item && item.reason === "quotaExceeded")
        })
      }

      return false
    })()

    if (quotaExceeded) {
      throw new YouTubeQuotaExceededError(message)
    }

    throw new Error(`YouTube API ${endpoint} request failed: ${response.status} ${message}`)
  }

  return (await response.json()) as T
}

export async function fetchChannelProfile(query: string): Promise<User> {
  const searchData = await callYouTubeApi<SearchListResponse>("search", {
    part: "snippet",
    q: query,
    type: "channel",
    maxResults: 1,
    fields: "items(id/channelId,snippet(channelId,title,description,publishedAt,thumbnails/default/url))",
  })

  const channelId = searchData.items?.[0]?.id?.channelId
  if (!channelId) {
    throw new Error("Channel not found")
  }

  const channelData = await callYouTubeApi<ChannelsListResponse>("channels", {
    part: "snippet,statistics",
    id: channelId,
    maxResults: 1,
    fields: "items(id,snippet(title,description,publishedAt,thumbnails/default/url),statistics(viewCount,subscriberCount))",
  })

  const channel = channelData.items?.[0]
  if (!channel) {
    throw new Error("Unable to load channel details")
  }

  const snippet = channel.snippet ?? {}
  const stats = channel.statistics ?? {}

  return {
    id: channelId,
    channelId,
    channelName: snippet.title ?? "Unknown channel",
    name: snippet.title ?? "Unknown channel",
    subscribers: Number(stats.subscriberCount ?? 0),
    totalViews: Number(stats.viewCount ?? 0),
    joinedDate: snippet.publishedAt ?? new Date().toISOString(),
    description: snippet.description ?? "",
    thumbnail: snippet.thumbnails?.default?.url ?? undefined,
  }
}

export async function fetchChannelVideos(channelId: string, maxResults = 25): Promise<Video[]> {
  const searchData = await callYouTubeApi<SearchListResponse>("search", {
    part: "snippet",
    channelId,
    order: "date",
    type: "video",
    maxResults,
    fields: "items(id/videoId,snippet(publishedAt,title,description,thumbnails/default/url,thumbnails/medium/url))",
  })

  const videoIds = searchData.items
    ?.map((item) => item.id?.videoId)
    .filter((id): id is string => Boolean(id))

  if (!videoIds?.length) {
    return []
  }

  const videoData = await callYouTubeApi<VideosListResponse>("videos", {
    part: "snippet,statistics,contentDetails",
    id: videoIds.join(","),
    fields:
      "items(id,snippet(publishedAt,title,description,tags,thumbnails/default/url,thumbnails/medium/url),statistics(viewCount,likeCount,commentCount),contentDetails(duration))",
  })

  return (videoData.items ?? [])
    .filter((item): item is NonNullable<typeof item> => Boolean(item.id))
    .map((item) => {
      const snippet = item.snippet ?? {}
      const stats = item.statistics ?? {}
      const contentDetails = item.contentDetails ?? {}

      return {
        id: item.id as string,
        title: snippet.title ?? "Untitled video",
        description: snippet.description ?? "",
        views: Number(stats.viewCount ?? 0),
        likes: Number(stats.likeCount ?? 0),
        comments: Number(stats.commentCount ?? 0),
        uploadDate: snippet.publishedAt ?? new Date().toISOString(),
        duration: parseIsoDuration(contentDetails.duration ?? "PT0S"),
        tags: snippet.tags ?? [],
        thumbnail: snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? "",
      }
    })
}

const REAL_TIME_POINT_COUNT = 12

function estimateAverageViewDuration(durationSeconds: number): number {
  const base = Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 240
  const lowerBound = Math.min(base, 60)
  const estimated = base * 0.55
  return Math.max(Math.min(estimated, base), lowerBound)
}

function buildRealTimePoint(now: Date, video: Video): RealTimeStatsPoint {
  const publishedAt = new Date(video.uploadDate)
  const diffInHours = Math.max((now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60), 0.25)
  const safeDiffInHours = Number.isFinite(diffInHours) && diffInHours > 0 ? diffInHours : 1

  const viewsPerHour = Math.round(video.views / safeDiffInHours)
  const likesPerHour = Math.round(video.likes / safeDiffInHours)
  const commentsPerHour = Math.round(video.comments / safeDiffInHours)

  const averageViewDuration = estimateAverageViewDuration(video.duration)
  const totalWatchTimeMinutes = (video.views * averageViewDuration) / 60
  const watchTimePerHourMinutes = Math.round(totalWatchTimeMinutes / safeDiffInHours)

  const durationMinutes = Math.max(video.duration / 60, 1)
  const estimatedActiveViewers = Math.max(Math.round(viewsPerHour / durationMinutes), 0)

  const labelFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })

  return {
    timestamp: publishedAt.toISOString(),
    label: labelFormatter.format(publishedAt),
    views: viewsPerHour,
    likes: likesPerHour,
    comments: commentsPerHour,
    watchTimeMinutes: watchTimePerHourMinutes,
    liveViewers: estimatedActiveViewers,
  }
}

export async function fetchRealTimeChannelStats(channelId: string): Promise<RealTimeStatsPayload> {
  const videos = await fetchChannelVideos(channelId, REAL_TIME_POINT_COUNT)
  const generatedAt = new Date()

  if (!videos.length) {
    return {
      points: [],
      summary: {
        averageViews: 0,
        engagementRate: 0,
        engagementChange: 0,
        viewsChange: 0,
        watchTimeHours: 0,
        totalEngagement: 0,
        totalViews: 0,
      },
      generatedAt: generatedAt.toISOString(),
    }
  }

  const recentVideos = videos.slice(0, REAL_TIME_POINT_COUNT)
  const points = recentVideos.map((video) => buildRealTimePoint(generatedAt, video)).reverse()

  const latestPoint = points[points.length - 1]
  const previousPoint = points[points.length - 2]

  const totalViews = recentVideos.reduce((total, video) => total + video.views, 0)
  const totalEngagement = recentVideos.reduce((total, video) => total + video.likes + video.comments, 0)
  const totalWatchTimeMinutes = recentVideos.reduce((total, video) => {
    const averageViewDuration = estimateAverageViewDuration(video.duration)
    return total + (video.views * averageViewDuration) / 60
  }, 0)

  const averageViews = points.length
    ? Math.round(points.reduce((sum, point) => sum + point.views, 0) / points.length)
    : 0

  const latestEngagement = latestPoint ? latestPoint.likes + latestPoint.comments : 0
  const previousEngagement = previousPoint ? previousPoint.likes + previousPoint.comments : 0

  const summary: RealTimeStatsSummary = {
    averageViews,
    engagementRate: latestPoint && latestPoint.views > 0 ? (latestEngagement / latestPoint.views) * 100 : 0,
    engagementChange:
      previousEngagement > 0
        ? ((latestEngagement - previousEngagement) / previousEngagement) * 100
        : 0,
    viewsChange:
      previousPoint && previousPoint.views > 0
        ? ((latestPoint.views - previousPoint.views) / previousPoint.views) * 100
        : 0,
    watchTimeHours: totalWatchTimeMinutes / 60,
    totalEngagement,
    totalViews,
  }

  return {
    points,
    summary,
    generatedAt: generatedAt.toISOString(),
  }
}

export async function fetchKeywordMetricsFromYouTube(keyword: string): Promise<YouTubeKeywordData> {
  const searchData = await callYouTubeApi<SearchListResponse>("search", {
    part: "snippet",
    q: keyword,
    type: "video",
    maxResults: 25,
    regionCode: "US",
    relevanceLanguage: "en",
    fields: "items(id/videoId),pageInfo/totalResults",
  })

  const videoIds = searchData.items
    ?.map((item) => item.id?.videoId)
    .filter((id): id is string => Boolean(id))

  if (!videoIds?.length) {
    throw new Error("No videos found for keyword")
  }

  const videoData = await callYouTubeApi<VideosListResponse>("videos", {
    part: "statistics,snippet",
    id: videoIds.join(","),
    fields:
      "items(id,snippet(publishedAt,title,description,tags,thumbnails/default/url,thumbnails/medium/url),statistics(viewCount,likeCount,commentCount))",
  })

  const stats = videoData.items ?? []
  if (!stats.length) {
    throw new Error("No statistics returned for keyword")
  }

  let totalViews = 0
  let totalEngagementRate = 0
  let recentViews = 0
  let olderViews = 0
  const now = new Date()

  stats.forEach((item) => {
    const views = Number(item.statistics?.viewCount ?? 0)
    const likes = Number(item.statistics?.likeCount ?? 0)
    const comments = Number(item.statistics?.commentCount ?? 0)
    const engagement = views > 0 ? (likes + comments) / views : 0
    totalViews += views
    totalEngagementRate += engagement

    const publishedAt = item.snippet?.publishedAt ? new Date(item.snippet.publishedAt) : null
    if (publishedAt) {
      const diffDays = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays <= 60) {
        recentViews += views
      } else {
        olderViews += views
      }
    }
  })

  const averageViews = totalViews / stats.length
  const averageEngagementRate = stats.length ? totalEngagementRate / stats.length : 0
  const totalResults = searchData.pageInfo?.totalResults ?? stats.length

  const competitionScore = calculateCompetitionScore(totalResults, averageEngagementRate, averageViews)
  const trendScore = calculateTrendScore(recentViews, olderViews)
  const monthlySearches = buildMonthlySearches(stats)

  const relatedKeywords = buildKeywordIdeas(stats, keyword)
  const searchVolume = Math.round(Math.max(averageViews, recentViews / Math.max(1, stats.length)) || 0)
  const difficulty = calculateDifficulty(competitionScore, searchVolume)

  return {
    keyword,
    searchVolume,
    competition: competitionScore,
    trend: trendScore,
    relatedKeywords,
    monthlySearches,
    difficulty,
    cpc: calculateCpcEstimate(searchVolume, averageEngagementRate),
    volume: searchVolume,
  }
}

export async function fetchKeywordSuggestions(keyword: string): Promise<string[]> {
  const searchData = await callYouTubeApi<SearchListResponse>("search", {
    part: "snippet",
    q: keyword,
    type: "video",
    maxResults: 25,
    order: "relevance",
    regionCode: "US",
    fields: "items(id/videoId)",
  })

  const videoIds = searchData.items
    ?.map((item) => item.id?.videoId)
    .filter((id): id is string => Boolean(id))

  if (!videoIds?.length) {
    throw new Error("No videos found for suggestions")
  }

  const videoData = await callYouTubeApi<VideosListResponse>("videos", {
    part: "snippet,statistics",
    id: videoIds.slice(0, 25).join(","),
    fields:
      "items(id,snippet(publishedAt,title,description,tags,thumbnails/default/url,thumbnails/medium/url),statistics(viewCount,likeCount,commentCount))",
  })

  const stats = videoData.items ?? []
  const rankedKeywords = rankKeywords(stats, keyword)
  if (!rankedKeywords.length) {
    throw new Error("No ranked keywords available")
  }

  return rankedKeywords.slice(0, 10)
}

export async function fetchTrendingKeywordData(category: string): Promise<YouTubeKeywordData[]> {
  const categoryId = getYouTubeCategoryId(category)

  const trendingVideos = await callYouTubeApi<VideosListResponse>("videos", {
    part: "snippet,statistics",
    chart: "mostPopular",
    maxResults: 30,
    regionCode: "US",
    videoCategoryId: categoryId,
    fields:
      "items(id,snippet(publishedAt,title,description,tags,thumbnails/default/url,thumbnails/medium/url),statistics(viewCount,likeCount,commentCount))",
  })

  const keywords = rankKeywords(trendingVideos.items ?? [], "").slice(0, 6)
  const uniqueKeywords = Array.from(new Set(keywords))

  const keywordData: YouTubeKeywordData[] = []
  for (const term of uniqueKeywords) {
    try {
      const data = await fetchKeywordMetricsFromYouTube(term)
      keywordData.push(data)
    } catch (error) {
      console.error("Failed to enrich trending keyword", term, error)
    }
  }

  if (!keywordData.length) {
    throw new Error("No trending keyword data available")
  }

  return keywordData.slice(0, 6)
}

function determineVelocity(score: number): TrendAlert["velocity"] {
  if (score >= 85) return "surging"
  if (score >= 70) return "rising"
  return "emerging"
}

function determineImpactLevel(score: number): TrendAlert["impactLevel"] {
  if (score >= 80) return "High"
  if (score >= 65) return "Medium"
  return "Watch"
}

function determineOpportunityWindow(velocity: TrendAlert["velocity"]): string {
  switch (velocity) {
    case "surging":
      return "Next 24 hours"
    case "rising":
      return "Next 3 days"
    default:
      return "Next 7 days"
  }
}

function buildSummary(topic: string, change24h: number, change7d: number, window: string): string {
  return `Search interest for "${topic}" is up ${change24h}% in the last 24 hours and ${change7d}% week-over-week. Launch within ${window.toLowerCase()} to stay ahead.`
}

function buildActionPlan(
  keyword: YouTubeKeywordData,
  velocity: TrendAlert["velocity"],
  change7d: number,
): string[] {
  const related = keyword.relatedKeywords.filter(Boolean)
  const supportingKeywords = related.slice(0, 3)
  const supportingCopy = supportingKeywords.length
    ? supportingKeywords.map((kw) => `"${kw}"`).join(", ")
    : `adjacent pain points around "${keyword.keyword}"`
  const hashtags = supportingKeywords.length
    ? supportingKeywords.map((kw) => `#${kw.replace(/\s+/g, "")}`).slice(0, 3).join(" ")
    : `#${keyword.keyword.replace(/\s+/g, "")}`

  const urgencyCopy =
    velocity === "surging"
      ? "Go live or publish a fast-turnaround deep dive"
      : velocity === "rising"
        ? "Schedule a polished upload"
        : "Outline a narrative video"

  return [
    `${urgencyCopy} centered on "${keyword.keyword}" while momentum is building (${change7d}% week-over-week growth).`,
    `Work supporting angles like ${supportingCopy} into your title, description, and mid-roll talking points.`,
    `Promote with Shorts or community posts highlighting the spike and include discovery tags such as ${hashtags}.`,
  ]
}

function estimateProjectedViews(keyword: YouTubeKeywordData, change7d: number): number {
  const growthMultiplier = 1 + Math.min(change7d, 160) / 100
  return Math.round(keyword.searchVolume * growthMultiplier)
}

export async function fetchTrendAlertFeed(category: string): Promise<TrendAlert[]> {
  const keywordData = await fetchTrendingKeywordData(category)
  const nowIso = new Date().toISOString()

  return keywordData
    .slice(0, 6)
    .map((keyword, index) => {
      const keywordScore = calculateKeywordScore(keyword)
      const momentumScore = Math.min(
        100,
        Math.round(keyword.trend * 0.65 + (100 - keyword.competition) * 0.35),
      )
      const change24h = Math.max(6, Math.round(keyword.trend * 0.45 + index * 2))
      const change7d = Math.max(change24h + 4, Math.round(keyword.trend * 0.85 + index * 3))
      const velocity = determineVelocity(momentumScore)
      const impactLevel = determineImpactLevel(keywordScore)
      const opportunityWindow = determineOpportunityWindow(velocity)

      return {
        id: `${category}-${keyword.keyword.replace(/\s+/g, "-")}-${index}`,
        topic: keyword.keyword,
        category,
        velocity,
        change24h,
        change7d,
        momentumScore,
        impactLevel,
        opportunityWindow,
        summary: buildSummary(keyword.keyword, change24h, change7d, opportunityWindow),
        recommendedActions: buildActionPlan(keyword, velocity, change7d),
        relatedKeywords: keyword.relatedKeywords,
        searchVolume: keyword.searchVolume,
        competition: keyword.competition,
        trendScore: keyword.trend,
        projectedViews: estimateProjectedViews(keyword, change7d),
        lastUpdated: nowIso,
      }
    })
    .sort((a, b) => b.momentumScore - a.momentumScore)
}

export async function fetchCompetitorKeywordInsights(channelName: string): Promise<string[]> {
  const channelSearch = await callYouTubeApi<SearchListResponse>("search", {
    part: "snippet",
    type: "channel",
    q: channelName,
    maxResults: 1,
    fields: "items(id/channelId,snippet(channelId,title))",
  })

  const channelId = channelSearch.items?.[0]?.snippet?.channelId
  if (!channelId) {
    throw new Error("Channel not found")
  }

  const channelVideos = await callYouTubeApi<SearchListResponse>("search", {
    part: "snippet",
    channelId,
    maxResults: 25,
    order: "viewCount",
    type: "video",
    fields: "items(id/videoId,snippet(publishedAt,title,description,thumbnails/default/url,thumbnails/medium/url))",
  })

  const videoIds = channelVideos.items
    ?.map((item) => item.id?.videoId)
    .filter((id): id is string => Boolean(id))

  if (!videoIds?.length) {
    throw new Error("No channel videos found")
  }

  const videoData = await callYouTubeApi<VideosListResponse>("videos", {
    part: "snippet,statistics",
    id: videoIds.join(","),
    fields:
      "items(id,snippet(publishedAt,title,description,tags,thumbnails/default/url,thumbnails/medium/url),statistics(viewCount,likeCount,commentCount))",
  })

  const ranked = rankKeywords(videoData.items ?? [], channelName)
  if (!ranked.length) {
    throw new Error("No competitor keywords ranked")
  }

  return ranked.slice(0, 12)
}

function calculateCompetitionScore(totalResults: number, engagementRate: number, averageViews: number): number {
  const volumePressure = Math.min(1, Math.log10(Math.max(totalResults, 10)) / 6)
  const engagementPressure = Math.min(1, engagementRate / 0.08)
  const viewPressure = Math.min(1, Math.log10(Math.max(averageViews, 100)) / 5)

  const rawScore = volumePressure * 50 + engagementPressure * 30 + viewPressure * 30
  return Math.min(100, Math.round(rawScore))
}

function calculateTrendScore(recentViews: number, olderViews: number): number {
  if (!recentViews && !olderViews) {
    return 50
  }

  if (!olderViews) {
    return Math.min(100, 80 + Math.round(Math.sqrt(recentViews + 1) % 20))
  }

  const ratio = recentViews / Math.max(olderViews, 1)
  const bounded = Math.max(0.3, Math.min(ratio, 3))
  return Math.min(100, Math.max(20, Math.round(50 + (bounded - 1) * 30)))
}

function calculateCpcEstimate(searchVolume: number, engagementRate: number): number {
  const base = Math.max(0.35, Math.min(12, (searchVolume / 50000) * 8))
  const engagementBonus = engagementRate > 0.06 ? 1.15 : engagementRate > 0.03 ? 1.05 : 0.95
  return Math.round(base * engagementBonus * 100) / 100
}

function buildMonthlySearches(stats: VideosListResponse["items"]): number[] {
  const buckets = Array.from({ length: 12 }, () => 0)
  const now = new Date()

  stats.forEach((item) => {
    const published = item.snippet?.publishedAt ? new Date(item.snippet.publishedAt) : null
    if (!published) return

    const monthsAgo = (now.getFullYear() - published.getFullYear()) * 12 + (now.getMonth() - published.getMonth())
    if (monthsAgo >= 0 && monthsAgo < 12) {
      const index = 11 - monthsAgo
      const views = Number(item.statistics?.viewCount ?? 0)
      buckets[index] += views
    }
  })

  if (buckets.every((value) => value === 0)) {
    const fallback = stats.slice(0, 6).map((item) => Number(item.statistics?.viewCount ?? 0))
    fallback.forEach((value, index) => {
      const position = 11 - index
      if (position >= 0) {
        buckets[position] = value
      }
    })
  }

  return buckets.map((value) => Math.round(value))
}

function buildKeywordIdeas(stats: VideosListResponse["items"], seed: string): string[] {
  const ranked = rankKeywords(stats, seed)
  return ranked.slice(0, 6)
}

function rankKeywords(stats: VideosListResponse["items"], seed: string): string[] {
  const scores = new Map<string, { weight: number }>()

  stats.forEach((item) => {
    const views = Number(item.statistics?.viewCount ?? 0)
    const tags = item.snippet?.tags ?? []
    const title = item.snippet?.title ?? ""
    const description = item.snippet?.description ?? ""

    const candidateKeywords = new Set<string>([...tags.map((tag) => tag.toLowerCase())])
    extractKeywordPhrases(title).forEach((phrase) => candidateKeywords.add(phrase))
    extractKeywordPhrases(description).forEach((phrase) => candidateKeywords.add(phrase))

    candidateKeywords.forEach((keyword) => {
      if (!keyword || keyword === seed.toLowerCase()) return
      const weight = views > 0 ? Math.log10(views + 1) : 1
      const entry = scores.get(keyword)
      if (entry) {
        entry.weight += weight
      } else {
        scores.set(keyword, { weight })
      }
    })
  })

  return Array.from(scores.entries())
    .sort((a, b) => b[1].weight - a[1].weight)
    .map(([keyword]) => keyword)
}

function extractKeywordPhrases(text: string): string[] {
  if (!text) return []

  const cleanText = text
    .toLowerCase()
    .replace(/[|:;#@!"'\\/(),?]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  const words = cleanText.split(" ").filter((word) => word && word.length > 2 && !STOP_WORDS.has(word))
  const phrases = new Set<string>()

  for (let index = 0; index < words.length; index++) {
    const current = words[index]
    if (!current) continue
    phrases.add(current)

    if (index < words.length - 1) {
      const bigram = `${current} ${words[index + 1]}`.trim()
      if (bigram.split(" ").every((term) => term.length > 2 && !STOP_WORDS.has(term))) {
        phrases.add(bigram)
      }
    }
  }

  return Array.from(phrases)
}

function getYouTubeCategoryId(category: string): string {
  const mapping: Record<string, string> = {
    technology: "28",
    business: "27",
    lifestyle: "26",
    finance: "25",
    health: "26",
    education: "27",
    gaming: "20",
    entertainment: "24",
    news: "25",
    sports: "17",
    travel: "19",
    food: "26",
    music: "10",
  }

  return mapping[category] ?? mapping.technology
}

function parseIsoDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = Number(match[1] ?? 0)
  const minutes = Number(match[2] ?? 0)
  const seconds = Number(match[3] ?? 0)
  return hours * 3600 + minutes * 60 + seconds
}
