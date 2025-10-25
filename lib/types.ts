// Core types for VidIStream driven entirely by live YouTube data

export interface User {
  id: string
  channelId: string
  channelName: string
  name: string
  subscribers: number
  totalViews: number
  joinedDate: string
  description?: string
  thumbnail?: string
}

export interface Video {
  id: string
  title: string
  description: string
  views: number
  likes: number
  comments: number
  uploadDate: string
  duration: number
  tags: string[]
  thumbnail: string
}

export interface TrendAlert {
  id: string
  topic: string
  category: string
  velocity: "surging" | "rising" | "emerging"
  change24h: number
  change7d: number
  momentumScore: number
  impactLevel: "High" | "Medium" | "Watch"
  opportunityWindow: string
  summary: string
  recommendedActions: string[]
  relatedKeywords: string[]
  searchVolume: number
  competition: number
  trendScore: number
  projectedViews: number
  lastUpdated: string
}

export interface CompetitorVideoSummary {
  id: string
  title: string
  views: number
  uploadDate: string
}

export interface CompetitorChannelMetrics {
  id: string
  name: string
  sourceQuery: string
  subscribers: number
  totalViews: number
  averageViews: number
  engagementRate: number
  uploadFrequency: number
  growthRate: number
  lastUpload: string | null
  topVideos: CompetitorVideoSummary[]
  topKeywords: string[]
}

export interface CompetitorInsights {
  contentGaps: string[]
  trendingTopics: string[]
  actionItems: string[]
}

export interface CompetitorAnalysisRequest {
  channel: Pick<User, "channelId" | "channelName" | "subscribers" | "totalViews"> & { id?: string }
  competitors: string[]
}

export interface CompetitorAnalysisResponse {
  baseChannel: CompetitorChannelMetrics
  competitors: CompetitorChannelMetrics[]
  insights: CompetitorInsights
  generatedAt: string
}
