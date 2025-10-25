import { predictBestUploadTimes } from "@/lib/optimization-engine"
import type { DailyIdea, User, Video } from "@/lib/types"

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
  "for",
  "using",
  "about",
  "make",
  "video",
  "series",
  "episode",
  "official",
  "live",
  "stream",
  "breaking",
  "update",
  "why",
])

const ANGLE_TEMPLATES = [
  (topic: string) => `Double down on ${topic} with a tactical breakdown`,
  (topic: string) => `React to the latest ${topic} headlines with actionable takeaways`,
  (topic: string) => `Build a viewer challenge centred on ${topic}`,
  (topic: string) => `Show how you execute ${topic} step-by-step in real time`,
]

export function generateDailyVideoIdeas(user: User, videos: Video[], count = 3): DailyIdea[] {
  const uploadTimes = predictBestUploadTimes()
  const averageViews = videos.length
    ? videos.reduce((sum, video) => sum + video.views, 0) / videos.length
    : 0
  const avgEngagementRate = videos.length
    ? videos.reduce((sum, video) => sum + getEngagementRate(video), 0) / videos.length
    : 0.045

  const baselineFromUser = getBaselineFromUser(user)
  const estimatedBaseline = Math.max(averageViews || 0, baselineFromUser, 1200)

  const context = {
    averageViews,
    avgEngagementRate,
    uploadTimes,
    estimatedBaseline,
  }

  const prioritizedVideos = videos
    .slice()
    .sort((a, b) => getVideoMomentumScore(b, context) - getVideoMomentumScore(a, context))
    .slice(0, count)

  const ideas: DailyIdea[] = prioritizedVideos.map((video, index) =>
    buildIdeaFromVideo(video, index, user, context),
  )

  return ideas
}

function buildIdeaFromVideo(
  video: Video,
  index: number,
  user: User,
  context: {
    averageViews: number
    avgEngagementRate: number
    uploadTimes: string[]
    estimatedBaseline: number
  },
): DailyIdea {
  const topic = extractFocusTopic(video.title)
  const template = ANGLE_TEMPLATES[index % ANGLE_TEMPLATES.length]
  const ideaTitle = template(topic)

  const viewLift = context.averageViews > 0 ? video.views / context.averageViews : 1
  const liftPercent = Math.round((viewLift - 1) * 100)
  const engagementRate = getEngagementRate(video)
  const engagementLift = context.avgEngagementRate > 0 ? engagementRate / context.avgEngagementRate : 1
  const engagementPercent = Math.round((engagementLift - 1) * 100)
  const daysOld = differenceInDays(new Date(video.uploadDate))
  const recencyBoost = 1 + Math.max(0, 21 - Math.min(daysOld, 45)) / 40
  const composite = viewLift * 0.55 + engagementLift * 0.25 + recencyBoost * 0.2
  const score = clamp(Math.round(composite * 22 + 38), 58, 97)
  const confidence = score >= 82 ? "High" : score >= 68 ? "Medium" : "Emerging"

  const projectedViews = Math.max(
    900,
    Math.round(context.estimatedBaseline * (1 + (score - 60) / 90)),
  )
  const engagementBoost = Math.max(6, Math.round((score - 50) * 0.6))

  const trendSignal = daysOld <= 7 ? "Fresh upload momentum" : daysOld <= 30 ? "Sustained audience interest" : "Evergreen demand still delivering"

  const summary =
    liftPercent > 0
      ? `"${video.title}" is delivering ${liftPercent}% more views than your typical upload. Give viewers a sequel that digs deeper into ${topic.toLowerCase()} while the momentum is hot.`
      : `"${video.title}" is still gaining traction, but engaged viewers are sticking around for the ${topic.toLowerCase()} angle. A sharper follow-up can convert that interest into a breakout.`

  const supportingPoints = [
    `Hook the first 15 seconds with a bold promise about ${topic.toLowerCase()}—use on-screen receipts from the original video to prove credibility.`,
    engagementPercent > 0
      ? `Repurpose the insights that sparked a ${engagementPercent}% engagement lift and translate them into a repeatable framework or checklist.`
      : `Crowdsource questions from "${video.title}" and weave the best ones into the narrative to spark conversation.`,
    `Schedule a companion Short or community post the same day to nudge viewers back toward the full upload.`,
  ]

  return {
    id: `daily-idea-${index}-${slugify(topic)}`,
    title: ideaTitle,
    summary,
    focusKeyword: topic,
    confidence,
    score,
    projectedViews,
    engagementBoost,
    recommendedUploadTime: context.uploadTimes[index % context.uploadTimes.length],
    supportingPoints,
    inspiration: video.title,
    performanceLift: liftPercent,
    trendSignal,
  }
}


function extractFocusTopic(title: string): string {
  const cleanTitle = title
    .replace(/[\[\](){}|:;#@"'!?.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!cleanTitle) {
    return "New Video Idea"
  }

  const parts = cleanTitle.split(" ")
  const keywords = parts.filter((word) => {
    const lower = word.toLowerCase()
    if (STOP_WORDS.has(lower)) return false
    if (lower.length <= 2 && word !== word.toUpperCase()) return false
    return true
  })

  const selection = keywords.length ? keywords : parts.slice(0, 3)
  return toTitleCase(selection.slice(0, 3).join(" "))
}

function getEngagementRate(video: Video): number {
  return (video.likes + video.comments) / Math.max(1, video.views)
}

function getBaselineFromUser(user: User): number {
  if (user.totalViews > 0 && user.subscribers > 0) {
    const viewsPerSubscriber = user.totalViews / user.subscribers
    return Math.max(900, Math.round(viewsPerSubscriber * 95))
  }
  return 1500
}

function getVideoMomentumScore(
  video: Video,
  context: { averageViews: number; avgEngagementRate: number },
): number {
  const viewLift = context.averageViews > 0 ? video.views / context.averageViews : 1
  const engagementRate = getEngagementRate(video)
  const engagementLift = context.avgEngagementRate > 0 ? engagementRate / context.avgEngagementRate : 1
  const daysOld = differenceInDays(new Date(video.uploadDate))
  const recencyBoost = 1 + Math.max(0, 30 - Math.min(daysOld, 60)) / 50
  return viewLift * 0.58 + engagementLift * 0.27 + recencyBoost * 0.15
}

function differenceInDays(date: Date): number {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function toTitleCase(text: string): string {
  return text
    .split(" ")
    .map((word) =>
      word.length
        ? word[0].toUpperCase() + word.slice(1).toLowerCase()
        : word,
    )
    .join(" ")
}
