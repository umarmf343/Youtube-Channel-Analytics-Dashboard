// Core types for VidIStream

export interface User {
  id: string
  name: string
  email: string
  channelId: string
  channelName: string
  subscribers: number
  totalViews: number
  joinedDate: Date
}

export interface Video {
  id: string
  title: string
  description: string
  views: number
  watchTime: number
  likes: number
  comments: number
  shares: number
  uploadDate: Date
  duration: number
  tags: string[]
  thumbnail: string
  seoScore: number
}

export interface Keyword {
  id: string
  term: string
  searchVolume: number
  competition: number
  trend: number
  score: number
  relatedKeywords: string[]
  difficulty: "Easy" | "Medium" | "Hard"
}

export interface Competitor {
  id: string
  channelName: string
  subscribers: number
  totalViews: number
  avgViews: number
  uploadFrequency: number
  topVideos: Video[]
  growthRate: number
}

export interface Analytics {
  views: number
  watchTime: number
  subscribers: number
  engagement: number
  ctr: number
  avgViewDuration: number
}

export interface TrendAlert {
  id: string
  keyword: string
  trend: number
  category: string
  createdAt: Date
}

export interface VideoOptimization {
  videoId: string
  titleScore: number
  descriptionScore: number
  tagsScore: number
  thumbnailScore: number
  overallScore: number
  suggestions: string[]
}

export interface SeoContentOption {
  id: string
  keyword: string
  tone: string
  hook: string
  title: string
  description: string
  tags: string[]
  hashtags: string[]
  seoScore: number
  estimatedMetrics: {
    views: number
    likes: number
    comments: number
    shares: number
    watchTime: number
  }
}

export interface SuggestionResults {
  keyword: string
  google: string[]
  youtube: string[]
  overlap: string[]
  questionIdeas: string[]
  longTailIdeas: string[]
}

export interface ShortScene {
  id: string
  text: string
  searchTerms: string[]
  duration: number
}

export interface ShortVideoConfig {
  orientation: "portrait" | "landscape" | "square"
  voice: string
  captionPosition: "top" | "middle" | "bottom"
  captionStyle: string
  music: string
  musicVolume: "low" | "medium" | "high"
}

export interface ShortVideoBlueprint {
  id: string
  title: string
  category: string
  scenes: ShortScene[]
  config: ShortVideoConfig
  performance: {
    retention: number
    completionRate: number
    suggestedHashtags: string[]
  }
}

export interface ScheduledPost {
  id: string
  title: string
  platform: "Long-form" | "Shorts" | "Live"
  scheduledFor: string
  bestTimeScore: number
  status: "Scheduled" | "Draft" | "Queued"
  focusKeyword: string
}

export interface AutomationWorkflow {
  id: string
  name: string
  description: string
  status: "Active" | "Paused"
  lastRun: string
  uplift: number
  tasksCompleted: number
}

export interface CommentInsight {
  id: string
  author: string
  sentiment: "Positive" | "Neutral" | "Negative"
  networkScore: number
  replies: number
  highlight: string
  influence: number
}

export interface TagPerformance {
  tag: string
  avgViews: number
  retention: number
  videosUsed: number
  lastUsed: string
}

export interface ForecastPoint {
  date: string
  predictedViews: number
  predictedSubscribers: number
  revenueProjection: number
}

export interface ChannelSnapshot {
  id: string
  title: string
  description: string
  thumbnail: string
  subscribers: number
  totalViews: number
  totalVideos: number
  engagementRate: number
  bestUploadTimes: string[]
  topLocations: string[]
}

export interface AudienceSegment {
  id: string
  name: string
  percentage: number
  primeTime: string
}
