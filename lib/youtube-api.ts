import type {
  CompetitorAnalysisRequest,
  CompetitorAnalysisResponse,
  TrendAlert,
  User,
  Video,
} from "@/lib/types"

import { fetchWithCache } from "./cache"

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
  competitorAnalysis: "/api/competitor-analysis",
  trendAlerts: "/api/trend-alerts",
} as const

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const message = typeof body.error === "string" ? body.error : "Unexpected API error"
    throw new Error(message)
  }

  return (await response.json()) as T
}

const TEN_MINUTES = 1000 * 60 * 10
const FIVE_MINUTES = 1000 * 60 * 5
const TWO_MINUTES = 1000 * 60 * 2

export async function fetchChannelProfile(query: string): Promise<User> {
  return fetchWithCache(
    `channel-profile:${query}`,
    async () => {
      const response = await fetch(`${API_ENDPOINTS.channelProfile}?query=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      return handleResponse<User>(response)
    },
    TEN_MINUTES,
  )
}

export async function fetchChannelVideos(channelId: string): Promise<Video[]> {
  return fetchWithCache(
    `channel-videos:${channelId}`,
    async () => {
      const response = await fetch(`${API_ENDPOINTS.channelVideos}?channelId=${encodeURIComponent(channelId)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      const payload = await handleResponse<{ videos: Video[] }>(response)
      return payload.videos
    },
    TEN_MINUTES,
  )
}

export async function fetchYouTubeKeywordData(keyword: string): Promise<YouTubeKeywordData> {
  return fetchWithCache(
    `keyword-data:${keyword}`,
    async () => {
      const response = await fetch(`${API_ENDPOINTS.keywordData}?keyword=${encodeURIComponent(keyword)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      return handleResponse<YouTubeKeywordData>(response)
    },
    FIVE_MINUTES,
  )
}

export async function fetchRelatedKeywords(keyword: string): Promise<string[]> {
  return fetchWithCache(
    `keyword-suggestions:${keyword}`,
    async () => {
      const response = await fetch(`${API_ENDPOINTS.suggestions}?keyword=${encodeURIComponent(keyword)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      const payload = await handleResponse<{ suggestions: string[] }>(response)
      return payload.suggestions
    },
    TWO_MINUTES,
  )
}

export async function fetchTrendingKeywords(category: string): Promise<YouTubeKeywordData[]> {
  return fetchWithCache(
    `trending-keywords:${category}`,
    async () => {
      const response = await fetch(`${API_ENDPOINTS.trending}?category=${encodeURIComponent(category)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      const payload = await handleResponse<{ keywords: YouTubeKeywordData[] }>(response)
      return payload.keywords
    },
    TWO_MINUTES,
  )
}

export async function fetchTrendAlerts(category: string): Promise<TrendAlert[]> {
  return fetchWithCache(
    `trend-alerts:${category}`,
    async () => {
      const response = await fetch(`${API_ENDPOINTS.trendAlerts}?category=${encodeURIComponent(category)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      const payload = await handleResponse<{ alerts: TrendAlert[] }>(response)
      return payload.alerts
    },
    TWO_MINUTES,
  )
}

export async function fetchCompetitorKeywords(channelName: string): Promise<string[]> {
  return fetchWithCache(
    `competitor-keywords:${channelName}`,
    async () => {
      const response = await fetch(`${API_ENDPOINTS.competitor}?channel=${encodeURIComponent(channelName)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

      const payload = await handleResponse<{ keywords: string[] }>(response)
      return payload.keywords
    },
    FIVE_MINUTES,
  )
}

export async function fetchCompetitorAnalysis(
  payload: CompetitorAnalysisRequest,
): Promise<CompetitorAnalysisResponse> {
  const response = await fetch(API_ENDPOINTS.competitorAnalysis, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  return handleResponse<CompetitorAnalysisResponse>(response)
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
