import type { TrendAlert, User, Video } from "@/lib/types"
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
  finance: [
    {
      keyword: "high yield savings strategy",
      searchVolume: 31000,
      competition: 49,
      trend: 81,
      relatedKeywords: ["passive income", "bank interest", "savings account"],
      monthlySearches: [
        9200, 9700, 10200, 10800, 11400, 12100, 12800, 13500, 14300, 15100, 16000, 16800,
      ],
      cpc: 3.6,
    },
    {
      keyword: "stock market recession plan",
      searchVolume: 28000,
      competition: 55,
      trend: 76,
      relatedKeywords: ["market crash", "index fund", "investing tips"],
      monthlySearches: [
        8700, 9100, 9500, 10000, 10500, 11200, 11800, 12500, 13200, 14000, 14900, 15700,
      ],
      cpc: 4.1,
    },
    {
      keyword: "beginner crypto staking",
      searchVolume: 26000,
      competition: 52,
      trend: 83,
      relatedKeywords: ["passive crypto", "defi yield", "staking guide"],
      monthlySearches: [
        7200, 7600, 8100, 8600, 9100, 9700, 10300, 11000, 11800, 12500, 13300, 14100,
      ],
      cpc: 2.9,
    },
  ],
  health: [
    {
      keyword: "functional fitness routine",
      searchVolume: 29000,
      competition: 46,
      trend: 84,
      relatedKeywords: ["mobility training", "core stability", "daily movement"],
      monthlySearches: [
        8300, 8700, 9200, 9800, 10400, 11100, 11800, 12500, 13300, 14100, 14900, 15700,
      ],
      cpc: 1.7,
    },
    {
      keyword: "gut health nutrition plan",
      searchVolume: 27000,
      competition: 48,
      trend: 79,
      relatedKeywords: ["microbiome diet", "anti inflammatory", "probiotic foods"],
      monthlySearches: [
        7800, 8200, 8600, 9100, 9600, 10100, 10700, 11300, 12000, 12700, 13400, 14100,
      ],
      cpc: 2.1,
    },
    {
      keyword: "cold plunge benefits",
      searchVolume: 32000,
      competition: 51,
      trend: 88,
      relatedKeywords: ["ice bath", "contrast therapy", "recovery tips"],
      monthlySearches: [
        9000, 9600, 10100, 10800, 11500, 12300, 13100, 13900, 14800, 15700, 16600, 17500,
      ],
      cpc: 2.4,
    },
  ],
  education: [
    {
      keyword: "ai study assistant",
      searchVolume: 24000,
      competition: 43,
      trend: 82,
      relatedKeywords: ["study workflow", "note taking app", "learning automation"],
      monthlySearches: [
        7100, 7500, 7900, 8400, 8900, 9500, 10100, 10800, 11500, 12300, 13100, 13900,
      ],
      cpc: 1.9,
    },
    {
      keyword: "college productivity system",
      searchVolume: 22000,
      competition: 47,
      trend: 74,
      relatedKeywords: ["study planner", "semester planning", "student workflow"],
      monthlySearches: [
        6600, 7000, 7400, 7900, 8300, 8800, 9400, 9900, 10600, 11300, 12000, 12800,
      ],
      cpc: 1.5,
    },
    {
      keyword: "language learning immersion",
      searchVolume: 26000,
      competition: 45,
      trend: 78,
      relatedKeywords: ["learn spanish fast", "language apps", "daily immersion"],
      monthlySearches: [
        7800, 8200, 8700, 9200, 9800, 10300, 10900, 11500, 12200, 12900, 13600, 14300,
      ],
      cpc: 1.8,
    },
  ],
  gaming: [
    {
      keyword: "speedrun practice tips",
      searchVolume: 30000,
      competition: 53,
      trend: 86,
      relatedKeywords: ["speedrun route", "pb strategies", "glitch tutorial"],
      monthlySearches: [
        9200, 9600, 10100, 10700, 11400, 12100, 12800, 13600, 14400, 15200, 16100, 17000,
      ],
      cpc: 1.2,
    },
    {
      keyword: "cozy game recommendations",
      searchVolume: 27000,
      competition: 50,
      trend: 79,
      relatedKeywords: ["indie games", "switch cozy", "relaxing gameplay"],
      monthlySearches: [
        7600, 8000, 8500, 9000, 9500, 10100, 10800, 11400, 12100, 12800, 13500, 14200,
      ],
      cpc: 1.0,
    },
    {
      keyword: "esports training routine",
      searchVolume: 25000,
      competition: 56,
      trend: 83,
      relatedKeywords: ["aim training", "team scrims", "game sense"],
      monthlySearches: [
        7000, 7400, 7900, 8400, 8900, 9500, 10100, 10800, 11500, 12300, 13100, 13900,
      ],
      cpc: 1.6,
    },
  ],
  entertainment: [
    {
      keyword: "streaming show breakdown",
      searchVolume: 28000,
      competition: 54,
      trend: 77,
      relatedKeywords: ["episode recap", "fan theories", "series analysis"],
      monthlySearches: [
        8100, 8500, 9000, 9500, 10100, 10700, 11300, 12000, 12700, 13400, 14200, 14900,
      ],
      cpc: 1.3,
    },
    {
      keyword: "viral meme history",
      searchVolume: 26000,
      competition: 48,
      trend: 85,
      relatedKeywords: ["internet lore", "trend explained", "pop culture"],
      monthlySearches: [
        7800, 8200, 8700, 9300, 9900, 10500, 11200, 11900, 12600, 13400, 14200, 15000,
      ],
      cpc: 0.9,
    },
    {
      keyword: "cinematic vlog tips",
      searchVolume: 24000,
      competition: 52,
      trend: 80,
      relatedKeywords: ["film transitions", "story driven vlog", "b roll"],
      monthlySearches: [
        7100, 7500, 8000, 8500, 9100, 9700, 10300, 10900, 11600, 12300, 13100, 13900,
      ],
      cpc: 1.4,
    },
  ],
  news: [
    {
      keyword: "global tech regulation",
      searchVolume: 23000,
      competition: 58,
      trend: 72,
      relatedKeywords: ["ai policy", "privacy law", "digital rights"],
      monthlySearches: [
        6700, 7100, 7600, 8100, 8700, 9300, 9900, 10600, 11300, 12100, 12900, 13700,
      ],
      cpc: 2.2,
    },
    {
      keyword: "economic outlook update",
      searchVolume: 25000,
      competition: 61,
      trend: 75,
      relatedKeywords: ["market forecast", "inflation report", "jobs data"],
      monthlySearches: [
        7200, 7600, 8100, 8600, 9200, 9800, 10500, 11200, 11900, 12700, 13500, 14300,
      ],
      cpc: 3.1,
    },
    {
      keyword: "climate policy briefing",
      searchVolume: 21000,
      competition: 55,
      trend: 78,
      relatedKeywords: ["emissions report", "renewable targets", "global summit"],
      monthlySearches: [
        6300, 6700, 7100, 7600, 8100, 8700, 9300, 9900, 10500, 11200, 11900, 12600,
      ],
      cpc: 1.8,
    },
  ],
  sports: [
    {
      keyword: "athlete recovery routine",
      searchVolume: 27000,
      competition: 50,
      trend: 84,
      relatedKeywords: ["mobility drills", "cryotherapy", "game day prep"],
      monthlySearches: [
        7800, 8200, 8700, 9300, 9900, 10500, 11200, 11900, 12700, 13500, 14300, 15100,
      ],
      cpc: 1.6,
    },
    {
      keyword: "basketball analytics breakdown",
      searchVolume: 24000,
      competition: 53,
      trend: 79,
      relatedKeywords: ["advanced stats", "shot chart", "pace and space"],
      monthlySearches: [
        7000, 7400, 7900, 8400, 8900, 9500, 10100, 10800, 11500, 12300, 13100, 13900,
      ],
      cpc: 1.3,
    },
    {
      keyword: "endurance training plan",
      searchVolume: 30000,
      competition: 47,
      trend: 82,
      relatedKeywords: ["marathon prep", "zone 2", "aerobic base"],
      monthlySearches: [
        8700, 9100, 9600, 10200, 10800, 11500, 12200, 12900, 13700, 14500, 15300, 16100,
      ],
      cpc: 1.9,
    },
  ],
  travel: [
    {
      keyword: "digital nomad visa guide",
      searchVolume: 26000,
      competition: 45,
      trend: 83,
      relatedKeywords: ["remote work travel", "visa requirements", "global mobility"],
      monthlySearches: [
        7600, 8000, 8500, 9000, 9600, 10200, 10800, 11500, 12200, 12900, 13700, 14500,
      ],
      cpc: 2.3,
    },
    {
      keyword: "slow travel itineraries",
      searchVolume: 23000,
      competition: 42,
      trend: 78,
      relatedKeywords: ["local experiences", "sustainable travel", "extended stay"],
      monthlySearches: [
        6900, 7300, 7800, 8300, 8800, 9300, 9900, 10500, 11100, 11800, 12500, 13200,
      ],
      cpc: 1.6,
    },
    {
      keyword: "carry on packing system",
      searchVolume: 24000,
      competition: 48,
      trend: 85,
      relatedKeywords: ["minimal travel", "packing cubes", "travel hacks"],
      monthlySearches: [
        7200, 7600, 8100, 8600, 9200, 9800, 10400, 11000, 11700, 12400, 13100, 13800,
      ],
      cpc: 1.4,
    },
  ],
  food: [
    {
      keyword: "high protein meal prep",
      searchVolume: 32000,
      competition: 57,
      trend: 88,
      relatedKeywords: ["macro friendly", "weekly prep", "meal planning"],
      monthlySearches: [
        9200, 9700, 10200, 10800, 11400, 12100, 12800, 13500, 14300, 15100, 16000, 16800,
      ],
      cpc: 1.8,
    },
    {
      keyword: "air fryer global recipes",
      searchVolume: 28000,
      competition: 53,
      trend: 82,
      relatedKeywords: ["fusion cooking", "quick dinners", "crispy recipes"],
      monthlySearches: [
        8100, 8500, 9000, 9600, 10100, 10700, 11300, 12000, 12700, 13400, 14200, 14900,
      ],
      cpc: 1.5,
    },
    {
      keyword: "budget gourmet hacks",
      searchVolume: 25000,
      competition: 46,
      trend: 79,
      relatedKeywords: ["cheap eats", "fine dining at home", "flavor boosters"],
      monthlySearches: [
        7600, 8000, 8500, 9000, 9500, 10100, 10700, 11300, 12000, 12700, 13400, 14100,
      ],
      cpc: 1.2,
    },
  ],
  music: [
    {
      keyword: "bedroom pop production",
      searchVolume: 28000,
      competition: 51,
      trend: 84,
      relatedKeywords: ["diy mixing", "indie vocals", "home studio"],
      monthlySearches: [
        8300, 8700, 9200, 9700, 10300, 10900, 11600, 12300, 13100, 13900, 14700, 15500,
      ],
      cpc: 1.6,
    },
    {
      keyword: "ai remix techniques",
      searchVolume: 26000,
      competition: 55,
      trend: 82,
      relatedKeywords: ["stems mixing", "music ai", "remix workflow"],
      monthlySearches: [
        7800, 8200, 8700, 9200, 9700, 10300, 10900, 11600, 12300, 13100, 13900, 14700,
      ],
      cpc: 1.4,
    },
    {
      keyword: "live looping performance",
      searchVolume: 24000,
      competition: 49,
      trend: 79,
      relatedKeywords: ["loop station", "improv set", "stage setup"],
      monthlySearches: [
        7200, 7600, 8100, 8600, 9100, 9700, 10300, 11000, 11700, 12400, 13100, 13800,
      ],
      cpc: 1.3,
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
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string
      }
    }
  }>
}

type PlaylistItemsListResponse = {
  items?: Array<{
    contentDetails?: {
      videoId?: string
      videoPublishedAt?: string
    }
  }>
  nextPageToken?: string
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
  const channelData = await callYouTubeApi<ChannelsListResponse>("channels", {
    part: "contentDetails",
    id: channelId,
    maxResults: 1,
  })

  const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
  if (!uploadsPlaylistId) {
    return []
  }

  const videoIds: string[] = []
  let pageToken: string | undefined

  while (videoIds.length < maxResults) {
    const remaining = Math.min(50, maxResults - videoIds.length)
    const playlistData = await callYouTubeApi<PlaylistItemsListResponse>("playlistItems", {
      part: "contentDetails",
      playlistId: uploadsPlaylistId,
      maxResults: remaining,
      pageToken,
    })

    const batchIds = (playlistData.items ?? [])
      .map((item) => item.contentDetails?.videoId)
      .filter((id): id is string => Boolean(id))

    videoIds.push(...batchIds)

    if (!playlistData.nextPageToken || videoIds.length >= maxResults) {
      break
    }

    pageToken = playlistData.nextPageToken
  }

  if (!videoIds.length) {
    return []
  }

  const videoData = await callYouTubeApi<VideosListResponse>("videos", {
    part: "snippet,statistics,contentDetails",
    id: videoIds.slice(0, maxResults).join(","),
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
