import type {
  User,
  Video,
  Keyword,
  Competitor,
  TrendAlert,
  ChannelSnapshot,
  ForecastPoint,
  TagPerformance,
  ScheduledPost,
  CommentInsight,
  AutomationWorkflow,
  ShortVideoBlueprint,
  SeoContentOption,
  AudienceSegment,
} from "./types"

export const mockUser: User = {
  id: "1",
  name: "Alex Creator",
  email: "alex@example.com",
  channelId: "UC123456",
  channelName: "Tech Insights Daily",
  subscribers: 245000,
  totalViews: 12500000,
  joinedDate: new Date("2020-01-15"),
}

export const mockVideos: Video[] = [
  {
    id: "1",
    title: "How to Master React Hooks in 2025",
    description: "Complete guide to React Hooks with real-world examples",
    views: 125000,
    watchTime: 450000,
    likes: 8500,
    comments: 2100,
    shares: 450,
    uploadDate: new Date("2025-10-15"),
    duration: 1200,
    tags: ["react", "javascript", "web-development", "hooks", "tutorial"],
    thumbnail: "/react-hooks.jpg",
    seoScore: 92,
  },
  {
    id: "2",
    title: "Next.js 16 Features Explained",
    description: "Deep dive into Next.js 16 new features and improvements",
    views: 98000,
    watchTime: 380000,
    likes: 6200,
    comments: 1800,
    shares: 320,
    uploadDate: new Date("2025-10-10"),
    duration: 1500,
    tags: ["nextjs", "javascript", "web-development", "tutorial"],
    thumbnail: "/nextjs-16.jpg",
    seoScore: 88,
  },
  {
    id: "3",
    title: "TypeScript Best Practices",
    description: "Learn TypeScript best practices for production applications",
    views: 156000,
    watchTime: 520000,
    likes: 9800,
    comments: 2500,
    shares: 580,
    uploadDate: new Date("2025-10-05"),
    duration: 1800,
    tags: ["typescript", "javascript", "programming", "best-practices"],
    thumbnail: "/typescript-logo.png",
    seoScore: 95,
  },
]

export const mockKeywords: Keyword[] = [
  {
    id: "1",
    term: "react hooks tutorial",
    searchVolume: 12500,
    competition: 65,
    trend: 85,
    score: 88,
    relatedKeywords: ["react hooks explained", "usestate useffect", "custom hooks"],
    difficulty: "Medium",
  },
  {
    id: "2",
    term: "nextjs 16 features",
    searchVolume: 8900,
    competition: 72,
    trend: 92,
    score: 85,
    relatedKeywords: ["nextjs app router", "nextjs server components", "nextjs optimization"],
    difficulty: "Hard",
  },
  {
    id: "3",
    term: "typescript tutorial",
    searchVolume: 15600,
    competition: 78,
    trend: 70,
    score: 72,
    relatedKeywords: ["typescript basics", "typescript types", "typescript interfaces"],
    difficulty: "Hard",
  },
  {
    id: "4",
    term: "web development 2025",
    searchVolume: 22000,
    competition: 85,
    trend: 88,
    score: 78,
    relatedKeywords: ["web development trends", "frontend development", "full stack development"],
    difficulty: "Hard",
  },
]

export const mockCompetitors: Competitor[] = [
  {
    id: "1",
    channelName: "Web Dev Masters",
    subscribers: 580000,
    totalViews: 45000000,
    avgViews: 125000,
    uploadFrequency: 3.5,
    topVideos: mockVideos.slice(0, 2),
    growthRate: 12.5,
  },
  {
    id: "2",
    channelName: "Code Academy",
    subscribers: 420000,
    totalViews: 32000000,
    avgViews: 98000,
    uploadFrequency: 2.8,
    topVideos: mockVideos.slice(1, 3),
    growthRate: 8.2,
  },
  {
    id: "3",
    channelName: "JavaScript Pro",
    subscribers: 310000,
    totalViews: 28000000,
    avgViews: 85000,
    uploadFrequency: 4.2,
    topVideos: mockVideos,
    growthRate: 15.8,
  },
]

export const mockTrendAlerts: TrendAlert[] = [
  {
    id: "1",
    keyword: "AI in web development",
    trend: 156,
    category: "Emerging",
    createdAt: new Date("2025-10-20"),
  },
  {
    id: "2",
    keyword: "React Server Components",
    trend: 142,
    category: "Rising",
    createdAt: new Date("2025-10-19"),
  },
  {
    id: "3",
    keyword: "TypeScript strict mode",
    trend: 98,
    category: "Stable",
    createdAt: new Date("2025-10-18"),
  },
]

export const mockAnalytics = {
  views: 379000,
  watchTime: 1350000,
  subscribers: 245000,
  engagement: 8.2,
  ctr: 4.5,
  avgViewDuration: 3.5,
}

export const mockChannelSnapshot: ChannelSnapshot = {
  id: "UC123456",
  title: "Tech Insights Daily",
  description:
    "Daily breakdowns of emerging developer workflows, AI-assisted productivity, and modern web performance tactics.",
  thumbnail: "/placeholder-user.jpg",
  subscribers: 245000,
  totalViews: 12500000,
  totalVideos: 482,
  engagementRate: 8.2,
  bestUploadTimes: ["Tuesday 2:00 PM", "Wednesday 3:00 PM", "Thursday 2:30 PM"],
  topLocations: ["United States", "India", "United Kingdom", "Canada"],
}

export const mockForecast: ForecastPoint[] = [
  { date: "Oct 25", predictedViews: 20500, predictedSubscribers: 246200, revenueProjection: 640 },
  { date: "Oct 28", predictedViews: 22400, predictedSubscribers: 246780, revenueProjection: 690 },
  { date: "Oct 31", predictedViews: 24800, predictedSubscribers: 247360, revenueProjection: 720 },
  { date: "Nov 03", predictedViews: 26800, predictedSubscribers: 248050, revenueProjection: 760 },
  { date: "Nov 06", predictedViews: 28900, predictedSubscribers: 248720, revenueProjection: 805 },
  { date: "Nov 09", predictedViews: 31500, predictedSubscribers: 249380, revenueProjection: 860 },
]

export const mockTagPerformance: TagPerformance[] = [
  { tag: "react hooks", avgViews: 135000, retention: 63, videosUsed: 12, lastUsed: "2025-10-20" },
  { tag: "nextjs performance", avgViews: 118000, retention: 58, videosUsed: 9, lastUsed: "2025-10-18" },
  { tag: "typescript tips", avgViews: 142000, retention: 66, videosUsed: 14, lastUsed: "2025-10-12" },
  { tag: "ai coding", avgViews: 161000, retention: 71, videosUsed: 7, lastUsed: "2025-10-09" },
  { tag: "productivity hacks", avgViews: 112000, retention: 55, videosUsed: 11, lastUsed: "2025-10-05" },
]

export const mockAudienceSegments: AudienceSegment[] = [
  { id: "seg-1", name: "Pro Developers", percentage: 42, primeTime: "Tue-Thu 2-4 PM" },
  { id: "seg-2", name: "Learners", percentage: 28, primeTime: "Sat-Sun 10 AM" },
  { id: "seg-3", name: "AI Enthusiasts", percentage: 18, primeTime: "Mon-Wed 8 PM" },
  { id: "seg-4", name: "Team Leads", percentage: 12, primeTime: "Fri 1 PM" },
]

export const mockSeoOptions: SeoContentOption[] = [
  {
    id: "seo-1",
    keyword: "react hooks tutorial",
    tone: "Authoritative",
    hook: "Master modern React in minutes",
    title: "Unlock React Hooks: 7 Proven Patterns for 2025 (Authoritative Secrets)",
    description:
      "Discover the exact hooks workflow senior engineers use in 2025. We cover useTransition, server actions, and production-ready patterns so you can ship faster.",
    tags: [
      "react hooks tutorial",
      "react server actions",
      "useTransition",
      "react 19",
      "frontend mastery",
    ],
    hashtags: ["#ReactHooks", "#WebDevelopment", "#JavaScript", "#CodingTips"],
    seoScore: 94,
    estimatedMetrics: {
      views: 185000,
      likes: 9800,
      comments: 2100,
      shares: 720,
      watchTime: 5400,
    },
  },
  {
    id: "seo-2",
    keyword: "nextjs 16 features",
    tone: "Excited",
    hook: "Reveal the hidden power plays",
    title: "Next.js 16 New Features Revealed: 5 Game-Changing Updates (Must-Try Workflows)",
    description:
      "Take a guided tour through the boldest Next.js 16 upgrades. We'll build lightning-fast routes, wire server mutations, and share exclusive deployment checklists.",
    tags: [
      "nextjs 16 features",
      "nextjs tutorial",
      "react server components",
      "edge rendering",
      "turbo deploy",
    ],
    hashtags: ["#Nextjs16", "#React", "#WebDev", "#JavaScript", "#Performance"],
    seoScore: 91,
    estimatedMetrics: {
      views: 162000,
      likes: 8700,
      comments: 1750,
      shares: 640,
      watchTime: 4800,
    },
  },
]

export const mockShortVideoBlueprints: ShortVideoBlueprint[] = [
  {
    id: "short-1",
    title: "5 AI Coding Tools in 60 Seconds",
    category: "Tech News",
    scenes: [
      {
        id: "scene-1",
        text: "Hook: The AI tools senior developers won't shut up about in 2025.",
        searchTerms: ["ai coding tools", "developer productivity", "ai assistants"],
        duration: 6,
      },
      {
        id: "scene-2",
        text: "Showcase: Visual demo of Cursor, Windsurf, and Copilot-powered refactors.",
        searchTerms: ["cursor ai", "windsurf ide", "github copilot"],
        duration: 10,
      },
      {
        id: "scene-3",
        text: "CTA: Comment your favorite AI workflow for a chance to win a premium license.",
        searchTerms: ["ai workflow", "coding giveaway"],
        duration: 5,
      },
    ],
    config: {
      orientation: "portrait",
      voice: "Energetic Female",
      captionPosition: "bottom",
      captionStyle: "Bold neon",
      music: "Energetic Synthwave",
      musicVolume: "high",
    },
    performance: {
      retention: 82,
      completionRate: 68,
      suggestedHashtags: ["#Shorts", "#AITools", "#Productivity"],
    },
  },
  {
    id: "short-2",
    title: "TypeScript Debug Trick You Need",
    category: "Developer Tips",
    scenes: [
      {
        id: "scene-1",
        text: "Pattern interrupt hook with a broken TypeScript build and red squiggles everywhere.",
        searchTerms: ["typescript error", "tsconfig", "debugging"],
        duration: 5,
      },
      {
        id: "scene-2",
        text: "Reveal the tsserver inspect workflow + show console.log alternative overlay.",
        searchTerms: ["typescript server", "tsserver inspect", "debug tips"],
        duration: 9,
      },
      {
        id: "scene-3",
        text: "CTA to download the debugging checklist in the description.",
        searchTerms: ["debug checklist", "typescript productivity"],
        duration: 4,
      },
    ],
    config: {
      orientation: "portrait",
      voice: "Neutral Male",
      captionPosition: "middle",
      captionStyle: "High contrast",
      music: "Lo-fi Focus",
      musicVolume: "medium",
    },
    performance: {
      retention: 76,
      completionRate: 64,
      suggestedHashtags: ["#DevTips", "#TypeScript", "#Coding"],
    },
  },
]

export const mockScheduledPosts: ScheduledPost[] = [
  {
    id: "sched-1",
    title: "AI vs Human Pair Programming",
    platform: "Long-form",
    scheduledFor: "2025-10-24 14:00",
    bestTimeScore: 94,
    status: "Scheduled",
    focusKeyword: "ai pair programming",
  },
  {
    id: "sched-2",
    title: "Short: Debugging in 30 Seconds",
    platform: "Shorts",
    scheduledFor: "2025-10-22 11:30",
    bestTimeScore: 88,
    status: "Queued",
    focusKeyword: "debugging tips",
  },
  {
    id: "sched-3",
    title: "Live Q&A: Scaling Next.js Apps",
    platform: "Live",
    scheduledFor: "2025-10-26 17:00",
    bestTimeScore: 91,
    status: "Draft",
    focusKeyword: "nextjs scaling",
  },
]

export const mockCommentInsights: CommentInsight[] = [
  {
    id: "insight-1",
    author: "TechExplorer",
    sentiment: "Positive",
    networkScore: 0.92,
    replies: 14,
    highlight: "This breakdown finally helped me understand React Server Actions!",
    influence: 87,
  },
  {
    id: "insight-2",
    author: "AsyncAvi",
    sentiment: "Neutral",
    networkScore: 0.78,
    replies: 9,
    highlight: "Requesting a follow-up on deployment best practices.",
    influence: 73,
  },
  {
    id: "insight-3",
    author: "DebugQueen",
    sentiment: "Negative",
    networkScore: 0.66,
    replies: 6,
    highlight: "The timestamps are slightly off for chapter three.",
    influence: 58,
  },
]

export const mockAutomationWorkflows: AutomationWorkflow[] = [
  {
    id: "auto-1",
    name: "Launch & Boost",
    description: "Publish video → schedule Shorts recap → auto-post community poll",
    status: "Active",
    lastRun: "2025-10-20 15:30",
    uplift: 18,
    tasksCompleted: 12,
  },
  {
    id: "auto-2",
    name: "Comment Concierge",
    description: "Flag high-priority questions and queue smart replies",
    status: "Active",
    lastRun: "2025-10-21 09:10",
    uplift: 11,
    tasksCompleted: 8,
  },
  {
    id: "auto-3",
    name: "Evergreen Refresh",
    description: "Identify videos losing velocity and refresh their SEO",
    status: "Paused",
    lastRun: "2025-10-18 18:45",
    uplift: 9,
    tasksCompleted: 5,
  },
]

export const mockVideoLibrary: Video[] = [
  ...mockVideos,
  {
    id: "4",
    title: "AI Pair Programming Playbook",
    description: "We stress-test AI coding partners against real-world tickets and share prompts that actually work.",
    views: 142000,
    watchTime: 510000,
    likes: 9100,
    comments: 2450,
    shares: 520,
    uploadDate: new Date("2025-09-28"),
    duration: 1350,
    tags: ["ai coding", "pair programming", "productivity"],
    thumbnail: "/placeholder.jpg",
    seoScore: 90,
  },
  {
    id: "5",
    title: "Ship Faster with Server Actions",
    description: "A zero-fluff walkthrough of advanced server actions patterns inside Next.js 16.",
    views: 118500,
    watchTime: 430000,
    likes: 7600,
    comments: 1980,
    shares: 410,
    uploadDate: new Date("2025-09-19"),
    duration: 1100,
    tags: ["nextjs", "server actions", "react"],
    thumbnail: "/placeholder.jpg",
    seoScore: 87,
  },
  {
    id: "6",
    title: "Frontend Performance Checklist 2025",
    description: "Optimize Core Web Vitals with the latest profiling techniques and tooling.",
    views: 164200,
    watchTime: 560000,
    likes: 10200,
    comments: 2890,
    shares: 630,
    uploadDate: new Date("2025-09-05"),
    duration: 1450,
    tags: ["performance", "core web vitals", "frontend"],
    thumbnail: "/placeholder.jpg",
    seoScore: 93,
  },
]
