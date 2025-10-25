import type { YouTubeKeywordData } from "@/lib/youtube-api"
import {
  calculateDifficulty,
  generateMockCompetitorKeywords,
  generateMockKeywordData,
  generateMockRelatedKeywords,
  generateMockTrendingKeywords,
} from "@/lib/youtube-api"

const API_BASE_URL = "https://www.googleapis.com/youtube/v3"
const API_KEY = process.env.YOUTUBE_API_KEY

class MissingYouTubeApiKeyError extends Error {
  constructor() {
    super("YOUTUBE_API_KEY is not configured")
    this.name = "MissingYouTubeApiKeyError"
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
    id?: { videoId?: string }
    snippet?: {
      publishedAt?: string
      title?: string
      description?: string
      channelId?: string
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
    }
    statistics?: {
      viewCount?: string
      likeCount?: string
      commentCount?: string
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
    const message = await response.text()
    throw new Error(`YouTube API ${endpoint} request failed: ${response.status} ${message}`)
  }

  return (await response.json()) as T
}

export async function fetchKeywordMetricsFromYouTube(keyword: string): Promise<YouTubeKeywordData> {
  try {
    const searchData = await callYouTubeApi<SearchListResponse>("search", {
      part: "snippet",
      q: keyword,
      type: "video",
      maxResults: 25,
      regionCode: "US",
      relevanceLanguage: "en",
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
  } catch (error) {
    console.warn("Falling back to simulated keyword metrics", { keyword, error })
    return generateMockKeywordData(keyword)
  }
}

export async function fetchKeywordSuggestions(keyword: string): Promise<string[]> {
  try {
    const searchData = await callYouTubeApi<SearchListResponse>("search", {
      part: "snippet",
      q: keyword,
      type: "video",
      maxResults: 25,
      order: "relevance",
      regionCode: "US",
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
    })

    const stats = videoData.items ?? []
    const rankedKeywords = rankKeywords(stats, keyword)
    if (!rankedKeywords.length) {
      throw new Error("No ranked keywords available")
    }

    return rankedKeywords.slice(0, 10)
  } catch (error) {
    console.warn("Falling back to simulated keyword suggestions", { keyword, error })
    return generateMockRelatedKeywords(keyword)
  }
}

export async function fetchTrendingKeywordData(category: string): Promise<YouTubeKeywordData[]> {
  try {
    const categoryId = getYouTubeCategoryId(category)

    const trendingVideos = await callYouTubeApi<VideosListResponse>("videos", {
      part: "snippet,statistics",
      chart: "mostPopular",
      maxResults: 30,
      regionCode: "US",
      videoCategoryId: categoryId,
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

    return keywordData.slice(0, 6)
  } catch (error) {
    console.warn("Falling back to simulated trending keywords", { category, error })
    return generateMockTrendingKeywords(category)
  }
}

export async function fetchCompetitorKeywordInsights(channelName: string): Promise<string[]> {
  try {
    const channelSearch = await callYouTubeApi<SearchListResponse>("search", {
      part: "snippet",
      type: "channel",
      q: channelName,
      maxResults: 1,
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
    })

    const ranked = rankKeywords(videoData.items ?? [], channelName)
    if (!ranked.length) {
      throw new Error("No competitor keywords ranked")
    }

    return ranked.slice(0, 12)
  } catch (error) {
    console.warn("Falling back to simulated competitor keywords", { channelName, error })
    return generateMockCompetitorKeywords(channelName)
  }
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
    business: "19",
    lifestyle: "26",
  }

  return mapping[category] ?? mapping.technology
}

