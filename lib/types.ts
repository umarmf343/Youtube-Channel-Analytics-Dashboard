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
