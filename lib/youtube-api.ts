import type { User, Video } from "@/lib/types"

export interface DailyVideoIdeaPerformance {
  expectedViews: number
  expectedWatchTimeMinutes: number
  expectedCtr: number
  confidence: number
}

export interface DailyVideoIdea {
  id: string
  title: string
  description: string
  hook: string
  format: "Long-form" | "Short" | "Livestream"
  primaryKeyword: string
  audienceFocus: string
  publishWindow: string
  supportingPoints: string[]
  aiInsights: string
  keywords: string[]
  tags: string[]
  performance: DailyVideoIdeaPerformance
}

export interface YouTubeKeywordData {
  keyword: string
  searchVolume: number
  competition: number
  trend: number
  relatedKeywords: string[]
  monthlySearches: number[]
  difficulty: "Easy" | "Medium" | "Hard"
  cpc: number
  volume: number
}

const API_ENDPOINTS = {
  keywordData: "/api/keyword-data",
  suggestions: "/api/keyword-suggestions",
  trending: "/api/trending-keywords",
  competitor: "/api/competitor-keywords",
  channelProfile: "/api/channel-profile",
  channelVideos: "/api/channel-videos",
  dailyIdeas: "/api/daily-ideas",
} as const

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const message = typeof body.error === "string" ? body.error : "Unexpected API error"
    throw new Error(message)
  }

  return (await response.json()) as T
}

export async function fetchChannelProfile(query: string): Promise<User> {
  const response = await fetch(`${API_ENDPOINTS.channelProfile}?query=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  return handleResponse<User>(response)
}

export async function fetchChannelVideos(channelId: string): Promise<Video[]> {
  const response = await fetch(`${API_ENDPOINTS.channelVideos}?channelId=${encodeURIComponent(channelId)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  const payload = await handleResponse<{ videos: Video[] }>(response)
  return payload.videos
}

export async function fetchYouTubeKeywordData(keyword: string): Promise<YouTubeKeywordData> {
  const response = await fetch(`${API_ENDPOINTS.keywordData}?keyword=${encodeURIComponent(keyword)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  return handleResponse<YouTubeKeywordData>(response)
}

export async function fetchRelatedKeywords(keyword: string): Promise<string[]> {
  const response = await fetch(`${API_ENDPOINTS.suggestions}?keyword=${encodeURIComponent(keyword)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  const payload = await handleResponse<{ suggestions: string[] }>(response)
  return payload.suggestions
}

export async function fetchTrendingKeywords(category: string): Promise<YouTubeKeywordData[]> {
  const response = await fetch(`${API_ENDPOINTS.trending}?category=${encodeURIComponent(category)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  const payload = await handleResponse<{ keywords: YouTubeKeywordData[] }>(response)
  return payload.keywords
}

export async function fetchCompetitorKeywords(channelName: string): Promise<string[]> {
  const response = await fetch(`${API_ENDPOINTS.competitor}?channel=${encodeURIComponent(channelName)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  const payload = await handleResponse<{ keywords: string[] }>(response)
  return payload.keywords
}

export async function fetchDailyVideoIdeas(
  channelId: string,
  options: { channelName?: string; focus?: string } = {},
): Promise<DailyVideoIdea[]> {
  const params = new URLSearchParams({ channelId })
  if (options.channelName) {
    params.set("channelName", options.channelName)
  }
  if (options.focus) {
    params.set("focus", options.focus)
  }

  const response = await fetch(`${API_ENDPOINTS.dailyIdeas}?${params.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  const payload = await handleResponse<{ ideas: DailyVideoIdea[] }>(response)
  return payload.ideas
}

export function calculateDifficulty(competition: number, volume: number): "Easy" | "Medium" | "Hard" {
  const score = competition * 0.6 + (volume / 1000) * 0.4
  if (score < 40) return "Easy"
  if (score < 70) return "Medium"
  return "Hard"
}

export function calculateKeywordScore(data: YouTubeKeywordData): number {
  const volumeScore = Math.min((data.searchVolume / 50000) * 100, 100)
  const competitionScore = Math.max(100 - data.competition, 0)
  const trendScore = data.trend

  return Math.round(volumeScore * 0.4 + competitionScore * 0.35 + trendScore * 0.25)
}

export function predictVideoPerformance(
  keywordScore: number,
  channelSize: "small" | "medium" | "large",
): {
  estimatedViews: number
  estimatedEngagement: number
  estimatedCTR: number
} {
  const channelMultiplier = { small: 1, medium: 2.5, large: 5 }[channelSize]
  const baseViews = keywordScore * 100 * channelMultiplier

  return {
    estimatedViews: Math.floor(baseViews),
    estimatedEngagement: Math.round(baseViews * 0.08),
    estimatedCTR: Math.round((keywordScore / 100) * 8 * 10) / 10,
  }
}
