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
