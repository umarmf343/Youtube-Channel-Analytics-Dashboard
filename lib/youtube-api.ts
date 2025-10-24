// Real-time YouTube keyword research API integration
// Provides typed helpers for interacting with VidIStream API routes and
// generates realistic fallback data when the live API is unavailable.

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
} as const

export async function fetchYouTubeKeywordData(keyword: string): Promise<YouTubeKeywordData> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.keywordData}?keyword=${encodeURIComponent(keyword)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch keyword data: ${response.status}`)
    }

    const data = (await response.json()) as YouTubeKeywordData
    return data
  } catch (error) {
    console.warn("Falling back to simulated keyword data", error)
    return generateMockKeywordData(keyword)
  }
}

export async function fetchRelatedKeywords(keyword: string): Promise<string[]> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.suggestions}?keyword=${encodeURIComponent(keyword)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch keyword suggestions: ${response.status}`)
    }

    const payload = (await response.json()) as { suggestions: string[] }
    return payload.suggestions
  } catch (error) {
    console.warn("Falling back to simulated keyword suggestions", error)
    return generateMockRelatedKeywords(keyword)
  }
}

export async function fetchTrendingKeywords(category: string): Promise<YouTubeKeywordData[]> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.trending}?category=${encodeURIComponent(category)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch trending keywords: ${response.status}`)
    }

    const payload = (await response.json()) as { keywords: YouTubeKeywordData[] }
    return payload.keywords
  } catch (error) {
    console.warn("Falling back to simulated trending keywords", error)
    return generateMockTrendingKeywords(category)
  }
}

export async function fetchCompetitorKeywords(channelName: string): Promise<string[]> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.competitor}?channel=${encodeURIComponent(channelName)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch competitor keywords: ${response.status}`)
    }

    const payload = (await response.json()) as { keywords: string[] }
    return payload.keywords
  } catch (error) {
    console.warn("Falling back to simulated competitor keywords", error)
    return generateMockCompetitorKeywords(channelName)
  }
}

export function generateMockKeywordData(keyword: string): YouTubeKeywordData {
  const baseVolume = Math.floor(Math.random() * 50000) + 1000
  const competition = Math.floor(Math.random() * 100)
  const trend = Math.floor(Math.random() * 50) + 50
  const monthlySearches = Array.from({ length: 12 }, () => Math.floor(baseVolume * (0.75 + Math.random() * 0.5)))
  const relatedKeywords = generateMockRelatedKeywords(keyword)
  const difficulty = calculateDifficulty(competition, baseVolume)

  return {
    keyword,
    searchVolume: baseVolume,
    competition,
    trend,
    relatedKeywords,
    monthlySearches,
    difficulty,
    cpc: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
    volume: baseVolume,
  }
}

export function generateMockRelatedKeywords(keyword: string): string[] {
  const keywords = [
    `${keyword} tutorial`,
    `${keyword} guide`,
    `${keyword} tips`,
    `${keyword} 2025`,
    `best ${keyword}`,
    `${keyword} for beginners`,
    `advanced ${keyword}`,
    `${keyword} examples`,
    `${keyword} strategies`,
    `${keyword} hacks`,
  ]

  return keywords.sort(() => Math.random() - 0.5).slice(0, 6)
}

export function generateMockTrendingKeywords(category: string): YouTubeKeywordData[] {
  return getTrendingTermsByCategory(category).map((term) => generateMockKeywordData(term))
}

export function generateMockCompetitorKeywords(channelName: string): string[] {
  return [
    `${channelName} tutorial`,
    `${channelName} guide`,
    `${channelName} strategy`,
    `best ${channelName} tips`,
    `${channelName} growth`,
    `${channelName} masterclass`,
  ]
}

function getTrendingTermsByCategory(category: string): string[] {
  const trendingByCategory: Record<string, string[]> = {
    technology: [
      "AI in web development",
      "React Server Components",
      "TypeScript strict mode",
      "Next.js 16 features",
      "Web3 development",
      "AI coding assistants",
    ],
    business: [
      "Digital marketing 2025",
      "SEO optimization",
      "Content marketing strategy",
      "Social media growth",
      "Email marketing automation",
      "Creator monetization tips",
    ],
    lifestyle: [
      "Fitness trends 2025",
      "Healthy eating habits",
      "Meditation for beginners",
      "Productivity hacks",
      "Work life balance",
      "Morning routine ideas",
    ],
  }

  return trendingByCategory[category] || trendingByCategory.technology
}

export function calculateDifficulty(competition: number, volume: number): "Easy" | "Medium" | "Hard" {
  const score = competition * 0.6 + (volume / 1000) * 0.4
  if (score < 40) return "Easy"
  if (score < 70) return "Medium"
  return "Hard"
}

// Calculate keyword score based on multiple factors
export function calculateKeywordScore(data: YouTubeKeywordData): number {
  const volumeScore = Math.min((data.searchVolume / 50000) * 100, 100)
  const competitionScore = Math.max(100 - data.competition, 0)
  const trendScore = data.trend

  // Weighted scoring: volume (40%), competition (35%), trend (25%)
  return Math.round(volumeScore * 0.4 + competitionScore * 0.35 + trendScore * 0.25)
}

// Predict video performance based on keyword metrics
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
