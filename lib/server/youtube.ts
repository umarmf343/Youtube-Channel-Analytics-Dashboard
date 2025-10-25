import type { User, Video } from "@/lib/types"
import type { TrendAlert, YouTubeKeywordData } from "@/lib/youtube-api"
import { calculateDifficulty } from "@/lib/youtube-api"

const API_BASE_URL = "https://www.googleapis.com/youtube/v3"
const API_KEY = process.env.YOUTUBE_API_KEY

export class MissingYouTubeApiKeyError extends Error {
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

type TrendingFallbackConfig = {
  keyword: string
  searchVolume: number
  competition: number
  trend: number
  relatedKeywords: string[]
  monthlySearches: number[]
  cpc: number
  volume?: number
}

const TRENDING_FALLBACK_KEYWORDS: Record<string, TrendingFallbackConfig[]> = {
  technology: [
    {
      keyword: "ai productivity tools",
      searchVolume: 42000,
      competition: 58,
      trend: 87,
      relatedKeywords: ["ai workflow", "automation apps", "ai planner"],
      monthlySearches: [
        14000, 15200, 16000, 17500, 18900, 20500, 21800, 23000, 24800, 26000, 27500, 28800,
      ],
      cpc: 3.2,
    },
    {
      keyword: "coding interview prep",
      searchVolume: 36000,
      competition: 65,
      trend: 74,
      relatedKeywords: ["system design", "leetcode study", "tech interview"],
      monthlySearches: [
        12500, 13200, 14000, 14500, 15000, 16200, 17000, 18400, 19500, 20500, 21800, 22400,
      ],
      cpc: 2.45,
    },
    {
      keyword: "edge computing explained",
      searchVolume: 28000,
      competition: 48,
      trend: 69,
      relatedKeywords: ["edge ai", "iot edge", "cloud vs edge"],
      monthlySearches: [
        8600, 9200, 9800, 10500, 11200, 11800, 12600, 13400, 14100, 14800, 15600, 16300,
      ],
      cpc: 1.85,
    },
  ],
  business: [
    {
      keyword: "micro saas ideas",
      searchVolume: 33000,
      competition: 52,
      trend: 82,
      relatedKeywords: ["bootstrap saas", "lean startup", "niche software"],
      monthlySearches: [
        9800, 10200, 10900, 11800, 12800, 13400, 14200, 15500, 16400, 17500, 18800, 19900,
      ],
      cpc: 2.1,
    },
    {
      keyword: "creator business models",
      searchVolume: 27000,
      competition: 44,
      trend: 76,
      relatedKeywords: ["digital products", "community launch", "membership sites"],
      monthlySearches: [
        7400, 8100, 8900, 9600, 10200, 10800, 11600, 12500, 13300, 14200, 15100, 16000,
      ],
      cpc: 1.75,
    },
    {
      keyword: "ai marketing funnels",
      searchVolume: 31000,
      competition: 60,
      trend: 84,
      relatedKeywords: ["ai lead gen", "marketing automation", "conversion workflow"],
      monthlySearches: [
        9200, 9900, 10500, 11300, 12000, 12800, 13600, 14500, 15600, 16800, 17900, 19100,
      ],
      cpc: 2.95,
    },
  ],
  lifestyle: [
    {
      keyword: "digital minimalism setup",
      searchVolume: 25000,
      competition: 42,
      trend: 71,
      relatedKeywords: ["minimal desktop", "habit reset", "mindful tech"],
      monthlySearches: [
        6800, 7200, 7600, 8100, 8700, 9300, 9900, 10500, 11200, 11800, 12500, 13100,
      ],
      cpc: 1.4,
    },
    {
      keyword: "healthy desk lunches",
      searchVolume: 29000,
      competition: 47,
      trend: 78,
      relatedKeywords: ["meal prep", "quick healthy meals", "office nutrition"],
      monthlySearches: [
        8100, 8600, 9100, 9700, 10200, 10900, 11600, 12300, 13100, 13800, 14600, 15300,
      ],
      cpc: 1.1,
    },
    {
      keyword: "home workout circuits",
      searchVolume: 34000,
      competition: 55,
      trend: 83,
      relatedKeywords: ["hiit at home", "no equipment workout", "30 minute workout"],
      monthlySearches: [
        9800, 10400, 11100, 11900, 12700, 13500, 14400, 15200, 16100, 17000, 17900, 18800,
      ],
      cpc: 1.65,
    },
  ],
}

function getTrendingFallback(category: string): YouTubeKeywordData[] {
  const normalized = category.toLowerCase()
  const fallback = TRENDING_FALLBACK_KEYWORDS[normalized] ?? TRENDING_FALLBACK_KEYWORDS.technology

  return fallback.map((item) => ({
    keyword: item.keyword,
    searchVolume: item.searchVolume,
    competition: item.competition,
    trend: item.trend,
    relatedKeywords: [...item.relatedKeywords],
    monthlySearches: [...item.monthlySearches],
    difficulty: calculateDifficulty(item.competition, item.searchVolume),
    cpc: item.cpc,
    volume: item.volume ?? item.searchVolume,
  }))
}

type TrendAlertFallback = {
  id: string
  topic: string
  stage: TrendAlert["stage"]
  momentumScore: number
  velocity: number
  last24hMentions: number
  summary: string
  recommendedActions: string[]
  keywords: string[]
  publishedGrowth: number
  confidence: number
  opportunityWindow: string
}

const TREND_ALERTS_FALLBACK: Record<string, TrendAlertFallback[]> = {
  technology: [
    {
      id: "ai-companion-tools",
      topic: "AI Companion Toolkits",
      stage: "Surging",
      momentumScore: 86,
      velocity: 142,
      last24hMentions: 880,
      summary:
        "YouTube creators are rapidly publishing walkthroughs and workflows around personal AI agents that automate knowledge work.",
      recommendedActions: [
        "Record a behind-the-scenes workflow showing how you deploy AI companions in your niche.",
        "Bundle prompt libraries or templates as a lead magnet in the description.",
      ],
      keywords: ["ai agent setup", "personal ai workflow", "notion ai companion"],
      publishedGrowth: 118,
      confidence: 78,
      opportunityWindow: "5-7 days before saturation",
    },
    {
      id: "spatial-computing-setups",
      topic: "Spatial Computing Desk Setups",
      stage: "Emerging",
      momentumScore: 73,
      velocity: 96,
      last24hMentions: 410,
      summary:
        "Interest in blending AR headsets with productivity desk setups is accelerating after recent headset OS updates.",
      recommendedActions: [
        "Publish a studio tour that highlights your spatial workspace configuration.",
        "Compare the new headset OS features against traditional multi-monitor setups.",
      ],
      keywords: ["vision pro workflow", "spatial monitors", "ar desk setup"],
      publishedGrowth: 84,
      confidence: 69,
      opportunityWindow: "Next 10 days with OS launch buzz",
    },
    {
      id: "coding-ai-coaches",
      topic: "AI Coding Coaches",
      stage: "Peaking",
      momentumScore: 64,
      velocity: 78,
      last24hMentions: 560,
      summary:
        "Educational creators are finding success with videos that compare AI coding copilots for rapid learning sprints.",
      recommendedActions: [
        "Host a 7-day coding challenge powered by your favorite AI coach.",
        "Include resource links and discount codes for affiliate conversion.",
      ],
      keywords: ["ai coding mentor", "pair programming ai", "code coach comparison"],
      publishedGrowth: 62,
      confidence: 72,
      opportunityWindow: "3-4 days before engagement cools",
    },
  ],
  business: [
    {
      id: "creator-income-stacks",
      topic: "Creator Income Stacks",
      stage: "Surging",
      momentumScore: 82,
      velocity: 134,
      last24hMentions: 640,
      summary:
        "Finance and solopreneur channels are dissecting multi-income stacks that combine digital products, memberships, and AI services.",
      recommendedActions: [
        "Publish a transparent income breakdown with tactical takeaways.",
        "Add worksheets or calculators as gated downloads for email capture.",
      ],
      keywords: ["creator income report", "digital product stack", "solopreneur revenue"],
      publishedGrowth: 102,
      confidence: 75,
      opportunityWindow: "1-2 weeks while viewers plan Q2 offers",
    },
    {
      id: "ai-sales-playbooks",
      topic: "AI Sales Playbooks",
      stage: "Emerging",
      momentumScore: 69,
      velocity: 91,
      last24hMentions: 360,
      summary:
        "B2B operators want scripts and automations that merge AI prospecting with human follow-up for hybrid funnels.",
      recommendedActions: [
        "Share a screen recorded walkthrough of your AI-enhanced outreach workflow.",
        "Bundle prompts and CRM automations in the description for download.",
      ],
      keywords: ["ai cold outreach", "sales automation prompt", "crm agent workflow"],
      publishedGrowth: 88,
      confidence: 66,
      opportunityWindow: "Next 8 days ahead of conference season",
    },
    {
      id: "community-monetization-upgrades",
      topic: "Community Monetization Upgrades",
      stage: "Peaking",
      momentumScore: 61,
      velocity: 72,
      last24hMentions: 420,
      summary:
        "Membership communities are releasing case studies about layering cohorts, masterminds, and AI office hours for retention.",
      recommendedActions: [
        "Film a teardown of your community funnel and retention strategy.",
        "Highlight testimonials or data visualizations that prove member ROI.",
      ],
      keywords: ["community revenue", "membership upsell", "ai office hours"],
      publishedGrowth: 58,
      confidence: 71,
      opportunityWindow: "4-5 days before saturation",
    },
  ],
  lifestyle: [
    {
      id: "digital-sabbath-routines",
      topic: "Digital Sabbath Routines",
      stage: "Emerging",
      momentumScore: 68,
      velocity: 94,
      last24hMentions: 510,
      summary:
        "Creators are packaging weekly unplug rituals that balance deep work sprints with intentional rest.",
      recommendedActions: [
        "Produce a vlog outlining your weekend reset routine with printable checklist.",
        "Share journaling prompts or habit trackers as a Notion template.",
      ],
      keywords: ["digital detox weekend", "sabbath routine", "deep work reset"],
      publishedGrowth: 76,
      confidence: 64,
      opportunityWindow: "Next 12 days as productivity goals refresh",
    },
    {
      id: "hybrid-fitness-retreats",
      topic: "Hybrid Fitness Retreats",
      stage: "Surging",
      momentumScore: 79,
      velocity: 128,
      last24hMentions: 450,
      summary:
        "Wellness channels highlight retreats that mix remote work, strength training, and nutrition coaching.",
      recommendedActions: [
        "Create a planning guide that compares retreat packages or share your itinerary.",
        "Offer a downloadable checklist for packing and remote work readiness.",
      ],
      keywords: ["fitness workcation", "wellness retreat planning", "hybrid training camp"],
      publishedGrowth: 94,
      confidence: 70,
      opportunityWindow: "7-9 days during booking rush",
    },
    {
      id: "smart-home-reset",
      topic: "Smart Home Reset Challenges",
      stage: "Peaking",
      momentumScore: 63,
      velocity: 74,
      last24hMentions: 380,
      summary:
        "Home creators host 30-day challenges to declutter, automate chores, and share progress dashboards.",
      recommendedActions: [
        "Launch your own reset challenge with weekly accountability downloads.",
        "Feature before/after automations and budgeting tips for upgrades.",
      ],
      keywords: ["smart home detox", "automation reset", "monthly home challenge"],
      publishedGrowth: 61,
      confidence: 67,
      opportunityWindow: "3-4 days before attention shifts",
    },
  ],
}

function getTrendAlertsFallback(niche: string): TrendAlert[] {
  const normalized = niche.toLowerCase()
  const fallback = TREND_ALERTS_FALLBACK[normalized] ?? TREND_ALERTS_FALLBACK.technology

  return fallback.map((item) => ({
    ...item,
    niche: normalized,
  }))
}

function toTitleCase(term: string): string {
  return term
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function calculateMomentumScore(data: YouTubeKeywordData): number {
  const volumeScore = Math.min((data.searchVolume / 50000) * 100, 100)
  const competitionRelief = Math.max(0, 100 - data.competition)
  const trend = data.trend

  return Math.round(volumeScore * 0.35 + competitionRelief * 0.25 + trend * 0.4)
}

function calculateVelocityScore(data: YouTubeKeywordData): number {
  const monthly = data.monthlySearches
  const recent = monthly[monthly.length - 1] ?? data.searchVolume
  const previous = monthly[monthly.length - 2] ?? Math.max(recent * 0.75, 1)
  const delta = recent - previous
  const growthRatio = previous > 0 ? delta / previous : 0

  const base = data.trend * 1.1 + Math.max(0, growthRatio) * 80
  return Math.max(35, Math.min(180, Math.round(base)))
}

function determineStage(data: YouTubeKeywordData): TrendAlert["stage"] {
  if (data.trend >= 85 && data.competition <= 65) {
    return "Surging"
  }
  if (data.trend >= 70 && data.competition <= 55) {
    return "Emerging"
  }
  return "Peaking"
}

function determineOpportunityWindow(stage: TrendAlert["stage"]): string {
  switch (stage) {
    case "Emerging":
      return "7-10 day early mover window"
    case "Surging":
      return "Publish within the next 3-5 days"
    case "Peaking":
    default:
      return "Move fast (2-3 days) before saturation"
  }
}

function buildRecommendedActions(topic: string, keywords: string[]): string[] {
  const primary = keywords[0] ?? topic
  const secondary = keywords[1] ?? primary

  return [
    `Ship a quick-turn explainer on ${topic} focusing on ${primary}.`,
    `Pair the video with a resource bundle or template targeting ${secondary} searches.`,
  ]
}

function buildAlertSummary(topic: string, data: YouTubeKeywordData, stage: TrendAlert["stage"], velocity: number): string {
  const spotlight = data.relatedKeywords[0] ?? data.keyword
  const competitionDescriptor = data.competition < 55 ? "low" : data.competition < 70 ? "moderate" : "high"

  return `${topic} is ${stage.toLowerCase()} with a ${velocity}% velocity score and ${data.trend}% search momentum while competition remains ${competitionDescriptor}. Viewers are especially engaging with ${spotlight} videos.`
}

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
    const message = await response.text()
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
  })

  const channelId = searchData.items?.[0]?.id?.channelId
  if (!channelId) {
    throw new Error("Channel not found")
  }

  const channelData = await callYouTubeApi<ChannelsListResponse>("channels", {
    part: "snippet,statistics",
    id: channelId,
    maxResults: 1,
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

export async function fetchKeywordMetricsFromYouTube(keyword: string): Promise<YouTubeKeywordData> {
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
}

export async function fetchKeywordSuggestions(keyword: string): Promise<string[]> {
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

    if (!keywordData.length) {
      throw new Error("No trending keyword data available")
    }

    return keywordData.slice(0, 6)
  } catch (error) {
    console.warn(
      `[youtube] Falling back to simulated trending keywords for category "${category}"`,
      error,
    )
    const fallback = getTrendingFallback(category)
    if (fallback.length) {
      return fallback
    }
    throw error
  }
}

export async function fetchTrendAlertsData(niche: string): Promise<TrendAlert[]> {
  if (!API_KEY) {
    return getTrendAlertsFallback(niche)
  }

  try {
    const keywordData = await fetchTrendingKeywordData(niche)

    if (!keywordData.length) {
      throw new Error("No keyword data available for trend alerts")
    }

    const alerts = keywordData.map((data) => {
      const topic = toTitleCase(data.keyword)
      const id = data.keyword
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
      const stage = determineStage(data)
      const momentumScore = Math.min(100, Math.max(45, calculateMomentumScore(data)))
      const velocity = calculateVelocityScore(data)
      const last24hMentions = Math.round(Math.max(120, data.searchVolume / 60))
      const publishedGrowth = Math.max(
        35,
        Math.min(170, Math.round(data.trend + Math.max(0, (100 - data.competition) * 0.45))),
      )
      const confidence = Math.min(95, Math.round(60 + Math.max(0, (100 - data.competition) * 0.35)))
      const opportunityWindow = determineOpportunityWindow(stage)
      const recommendedActions = buildRecommendedActions(topic, data.relatedKeywords)
      const summary = buildAlertSummary(topic, data, stage, velocity)

      const keywords = data.relatedKeywords.length ? data.relatedKeywords.slice(0, 4) : [data.keyword]

      return {
        id: id || data.keyword.replace(/\s+/g, "-").toLowerCase(),
        topic,
        niche: niche.toLowerCase(),
        stage,
        momentumScore,
        velocity,
        last24hMentions,
        summary,
        recommendedActions,
        keywords,
        publishedGrowth,
        confidence,
        opportunityWindow,
      }
    })

    const uniqueAlerts = Array.from(new Map(alerts.map((alert) => [alert.id, alert])).values())

    return uniqueAlerts.slice(0, 6)
  } catch (error) {
    console.warn(`[youtube] Falling back to simulated trend alerts for niche "${niche}"`, error)
    const fallback = getTrendAlertsFallback(niche)
    if (fallback.length) {
      return fallback
    }
    throw error
  }
}

export async function fetchCompetitorKeywordInsights(channelName: string): Promise<string[]> {
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

function parseIsoDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = Number(match[1] ?? 0)
  const minutes = Number(match[2] ?? 0)
  const seconds = Number(match[3] ?? 0)
  return hours * 3600 + minutes * 60 + seconds
}
