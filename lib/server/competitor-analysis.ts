import type {
  CompetitorAnalysisRequest,
  CompetitorAnalysisResponse,
  CompetitorChannelMetrics,
  CompetitorInsights,
  CompetitorVideoSummary,
  User,
  Video,
} from "@/lib/types"

import { fetchChannelProfile, fetchChannelVideos } from "@/lib/server/youtube"

const KEYWORD_STOP_WORDS = new Set([
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
  "official",
  "video",
  "episode",
  "series",
  "daily",
  "weekly",
  "review",
  "reviews",
  "new",
  "live",
  "premiere",
  "update",
  "for",
  "you",
  "why",
  "top",
  "vs",
  "behind",
  "scenes",
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#]+/i)
    .map((token) => token.replace(/^#+/, "").trim())
    .filter((token) => token.length >= 3 && !KEYWORD_STOP_WORDS.has(token))
}

function addKeyword(raw: string, weight: number, map: Map<string, number>) {
  tokenize(raw).forEach((token) => {
    const current = map.get(token) ?? 0
    map.set(token, current + weight)
  })
}

function collectTopKeywords(videos: Video[], limit = 6): string[] {
  if (!videos.length) return []

  const weights = new Map<string, number>()

  videos.forEach((video) => {
    const baseWeight = Math.max(1, Math.log10(video.views + 1) * 4)
    video.tags.forEach((tag) => addKeyword(tag, baseWeight * 1.8, weights))
    tokenize(video.title).forEach((word) => addKeyword(word, baseWeight, weights))

    const descriptionTokens = tokenize(video.description).slice(0, 20)
    descriptionTokens.forEach((word, index) => {
      const decay = Math.max(0.15, 1 - index / 20)
      addKeyword(word, baseWeight * 0.35 * decay, weights)
    })
  })

  return Array.from(weights.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([keyword]) => keyword)
}

function computeAverageViews(videos: Video[]): number {
  if (!videos.length) return 0
  const total = videos.reduce((sum, video) => sum + Math.max(0, video.views), 0)
  return total / videos.length
}

function computeEngagementRate(videos: Video[]): number {
  if (!videos.length) return 0
  const total = videos.reduce((sum, video) => {
    if (video.views <= 0) return sum
    const engagement = (video.likes + video.comments) / video.views
    return sum + engagement
  }, 0)
  return Math.round(((total / videos.length) * 100) * 10) / 10
}

function computeUploadFrequency(videos: Video[]): number {
  if (!videos.length) return 0
  const dates = videos
    .map((video) => new Date(video.uploadDate))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  if (!dates.length) {
    return Math.round((videos.length / 6) * 10) / 10
  }

  const first = dates[0]
  const last = dates[dates.length - 1]
  const monthsSpanned = Math.max(
    1,
    Math.min(12, (last.getFullYear() - first.getFullYear()) * 12 + (last.getMonth() - first.getMonth()) + 1),
  )

  return Math.round(((videos.length / monthsSpanned) * 10) * 10) / 10
}

function computeGrowthRate(videos: Video[]): number {
  if (!videos.length) return 0
  const now = Date.now()
  let recent = 0
  let older = 0

  videos.forEach((video) => {
    const date = new Date(video.uploadDate)
    const views = Math.max(0, video.views)
    if (Number.isNaN(date.getTime())) {
      recent += views
      return
    }

    const diffDays = (now - date.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays <= 60) {
      recent += views
    } else {
      older += views
    }
  })

  if (!older) {
    if (!recent) return 0
    return Math.min(120, Math.round(Math.sqrt(recent) * 2))
  }

  const change = (recent - older) / older
  return Math.round(change * 1000) / 10
}

function computeLastUpload(videos: Video[]): string | null {
  const latest = videos
    .map((video) => new Date(video.uploadDate))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0]

  return latest ? latest.toISOString() : null
}

function computeTopVideos(videos: Video[], limit = 3): CompetitorVideoSummary[] {
  return videos
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
    .map((video) => ({
      id: video.id,
      title: video.title,
      views: video.views,
      uploadDate: video.uploadDate,
    }))
}

function buildMetricsFromData(
  profile: User,
  videos: Video[],
  sourceQuery: string,
): CompetitorChannelMetrics {
  const computedAverage = computeAverageViews(videos)
  const fallbackAverage = profile.totalViews ? profile.totalViews / Math.max(videos.length || 1, 12) : 0
  const averageViews = Math.round(videos.length ? computedAverage : fallbackAverage || 0)

  return {
    id: profile.channelId,
    name: profile.channelName,
    sourceQuery,
    subscribers: profile.subscribers,
    totalViews: profile.totalViews,
    averageViews: averageViews || Math.round(profile.totalViews / Math.max(1, videos.length || 24)),
    engagementRate: computeEngagementRate(videos),
    uploadFrequency: computeUploadFrequency(videos),
    growthRate: computeGrowthRate(videos),
    lastUpload: computeLastUpload(videos),
    topVideos: computeTopVideos(videos),
    topKeywords: collectTopKeywords(videos),
  }
}


function computeInsights(
  base: CompetitorChannelMetrics,
  competitors: CompetitorChannelMetrics[],
): CompetitorInsights {
  if (!competitors.length) {
    return { contentGaps: [], trendingTopics: [], actionItems: [] }
  }

  const baseKeywords = new Set(base.topKeywords)
  const gapCandidates = new Map<string, { score: number; source: string }>()
  const trending = new Map<string, number>()

  competitors.forEach((competitor) => {
    competitor.topKeywords.forEach((keyword, index) => {
      const weight = competitor.averageViews / (index + 1)
      trending.set(keyword, (trending.get(keyword) ?? 0) + weight)

      if (!baseKeywords.has(keyword)) {
        const existing = gapCandidates.get(keyword)
        const score = weight + (existing?.score ?? 0)
        const source = existing?.source ?? competitor.name
        gapCandidates.set(keyword, { score, source })
      }
    })
  })

  const gapEntries = Array.from(gapCandidates.entries()).sort((a, b) => b[1].score - a[1].score)
  const contentGaps = gapEntries.slice(0, 6).map(([keyword]) => keyword)

  const trendingTopics = Array.from(trending.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([keyword]) => keyword)

  const strongest = competitors.reduce((prev, current) => {
    if (!prev) return current
    const prevScore = prev.averageViews * Math.max(prev.engagementRate, 1)
    const currentScore = current.averageViews * Math.max(current.engagementRate, 1)
    return currentScore > prevScore ? current : prev
  }, competitors[0])

  const actionItems: string[] = []
  if (contentGaps.length) {
    const leading = gapEntries[0]
    if (leading) {
      actionItems.push(
        `Publish a video targeting "${leading[0]}" to close the gap with ${leading[1].source}.`,
      )
    }
  }

  if (strongest) {
    const frequencyDelta = strongest.uploadFrequency - base.uploadFrequency
    if (frequencyDelta > 0.5) {
      actionItems.push(
        `Increase upload cadence by about ${frequencyDelta.toFixed(1)} videos/month to match ${strongest.name}.`,
      )
    }

    if (strongest.engagementRate > base.engagementRate + 1) {
      actionItems.push(
        `${strongest.name} captures more interaction (${strongest.engagementRate.toFixed(
          1,
        )}% vs ${base.engagementRate.toFixed(1)}%). Study their hooks and calls to action.`,
      )
    }
  }

  if (!actionItems.length && trendingTopics.length) {
    actionItems.push(`Experiment with a series around "${trendingTopics[0]}" to capture emerging demand.`)
  }

  return {
    contentGaps,
    trendingTopics,
    actionItems,
  }
}

export async function analyzeCompetitors(
  request: CompetitorAnalysisRequest,
): Promise<CompetitorAnalysisResponse> {
  const competitorQueries = request.competitors.map((item) => item.trim()).filter(Boolean)
  if (!competitorQueries.length) {
    throw new Error("At least one competitor channel is required")
  }

  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error("YouTube API key is required for competitor analysis")
  }

  const baseQuery =
    request.channel.channelId?.trim() ||
    request.channel.id?.trim() ||
    request.channel.channelName.trim()

  if (!baseQuery) {
    throw new Error("Base channel information is required")
  }

  const baseProfile = await fetchChannelProfile(baseQuery)
  const baseVideos = await fetchChannelVideos(baseProfile.channelId, 40)
  const baseMetrics = buildMetricsFromData(baseProfile, baseVideos, request.channel.channelName)

  const competitors = await Promise.all(
    competitorQueries.map(async (query) => {
      const profile = await fetchChannelProfile(query)
      const videos = await fetchChannelVideos(profile.channelId, 40)
      return buildMetricsFromData(profile, videos, query)
    }),
  )

  const insights = computeInsights(baseMetrics, competitors)
  return {
    baseChannel: baseMetrics,
    competitors,
    insights,
    generatedAt: new Date().toISOString(),
  }
}
