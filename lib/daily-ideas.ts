import { predictBestUploadTimes } from "@/lib/optimization-engine"
import type { DailyIdea, User, Video } from "@/lib/types"

type ChannelNiche = "tech" | "business" | "creator" | "lifestyle"

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

const FALLBACK_TEMPLATES: Record<ChannelNiche, Array<(user: User) => Omit<DailyIdea, "id" | "score" | "confidence" | "projectedViews" | "engagementBoost" | "recommendedUploadTime">>> = {
  tech: [
    (user) => ({
      title: "Ship an AI productivity sprint",
      summary: `Film a build-with-me session showing how ${user.channelName} automates a manual workflow in under 30 minutes.`,
      focusKeyword: "AI workflow",
      supportingPoints: [
        "Highlight the exact prompt stack or tools you trust for reliable output.",
        "Include a real-time benchmark comparing manual vs automated time savings.",
        "Tease a downloadable checklist in the description for deeper engagement.",
      ],
      trendSignal: "Automation curiosity is peaking across creator channels.",
    }),
    (user) => ({
      title: "Developers' office hours Q&A",
      summary: `Host a short-form Q&A tackling the most up-voted questions from ${user.channelName}'s comments and community tab.`,
      focusKeyword: "developer tips",
      supportingPoints: [
        "Batch the top three pain points and answer them with code snippets on screen.",
        "Invite viewers to submit follow-ups for a sequenced series.",
        "Clip standout answers into Shorts for cross-platform reach.",
      ],
      trendSignal: "Viewers love direct access to creator expertise.",
    }),
    (user) => ({
      title: "State of the tools breakdown",
      summary: `Compare the latest releases or updates in your stack and close with the tool ${user.channelName} is betting on next.`,
      focusKeyword: "tech stack review",
      supportingPoints: [
        "Score each tool on speed, accuracy, and learning curve for quick clarity.",
        "Layer in B-roll or screen recordings to keep the analysis high energy.",
        "End with a roadmap preview teasing upcoming experiments on the channel.",
      ],
      trendSignal: "Audiences seek curated recommendations before adopting new tools.",
    }),
  ],
  business: [
    (user) => ({
      title: "Launch a monetization teardown",
      summary: `Reverse engineer a standout business model your audience respects and translate it into a playbook for ${user.channelName}.`,
      focusKeyword: "business model",
      supportingPoints: [
        "Break revenue streams into a visual funnel so viewers can copy the flow.",
        "Share the metrics to watch in the first 30 days to validate traction.",
        "Close with a worksheet or KPI tracker linked in the description.",
      ],
      trendSignal: "Entrepreneurs crave actionable revenue experiments right now.",
    }),
    (user) => ({
      title: "Community-driven growth experiment",
      summary: `Document a 7-day sprint testing a community tactic and report daily metrics back to the ${user.channelName} audience.`,
      focusKeyword: "growth experiment",
      supportingPoints: [
        "Kick off with baseline numbers so the improvement is easy to visualize.",
        "Invite viewers to replicate the experiment alongside you and share outcomes.",
        "Highlight the most surprising win or failure and what you'll iterate next.",
      ],
      trendSignal: "Transparent experiments outperform polished theory in business niches.",
    }),
    (user) => ({
      title: "Market pulse mini-report",
      summary: `Summarize three under-the-radar trends shaping your niche and explain how ${user.channelName} is positioning for them.`,
      focusKeyword: "market trends",
      supportingPoints: [
        "Lead with a bold stat or chart to anchor attention in the first moments.",
        "Share a checklist of moves to make this week while the window is open.",
        "Add a viewer poll in the community tab to gather reactions for a follow-up.",
      ],
      trendSignal: "Timely intel keeps loyal subscribers checking back weekly.",
    }),
  ],
  lifestyle: [
    (user) => ({
      title: "Design a habit reset challenge",
      summary: `Outline a five-day reset routine your ${user.channelName} community can follow together, complete with progress prompts.`,
      focusKeyword: "habit reset",
      supportingPoints: [
        "Map each day to a single keystone habit with before/after visuals.",
        "Layer in journaling or reflection prompts to keep viewers accountable.",
        "Encourage viewers to tag you on socials to amplify community energy.",
      ],
      trendSignal: "Seasonal resets trend every month across wellness feeds.",
    }),
    (user) => ({
      title: "Behind-the-scenes workflow tour",
      summary: `Walk viewers through the systems keeping your lifestyle content consistent—even on busy weeks.`,
      focusKeyword: "routine systems",
      supportingPoints: [
        "Highlight the tools or templates you rely on to stay organized.",
        "Contrast an unplanned day vs. a structured day for relatability.",
        "Offer a downloadable planner or notion board as a value-add.",
      ],
      trendSignal: "Audiences want practical routines they can duplicate immediately.",
    }),
    (user) => ({
      title: "Budget-friendly glow up",
      summary: `Share affordable swaps or hacks that deliver premium results without premium pricing for the ${user.channelName} audience.`,
      focusKeyword: "budget glow up",
      supportingPoints: [
        "Use side-by-side visuals to prove the transformation.",
        "List exact products, prices, and where to buy to remove friction.",
        "Suggest how to remix the routine for busy or travel days.",
      ],
      trendSignal: "Value-driven refresh content is spiking across lifestyle Shorts.",
    }),
  ],
  creator: [
    (user) => ({
      title: "Audience story spotlight",
      summary: `Turn a subscriber success story into a cinematic case study to celebrate your ${user.channelName} community.`,
      focusKeyword: "community story",
      supportingPoints: [
        "Collect social proof or testimonials to anchor credibility.",
        "Break the story into chapters with on-screen timestamps.",
        "Prompt viewers to submit their own wins for future features.",
      ],
      trendSignal: "Story-first formats unlock high watch time across creator channels.",
    }),
    (user) => ({
      title: "Creator toolkit drop",
      summary: `Reveal the essential resources powering ${user.channelName} and rank them by impact, cost, and time to implement.`,
      focusKeyword: "creator toolkit",
      supportingPoints: [
        "Feature real dashboards or templates to keep it tangible.",
        "Mention alternatives for beginners vs. advanced viewers.",
        "Close with a challenge inviting viewers to share their go-to tools.",
      ],
      trendSignal: "Viewers expect creators to curate the noise and recommend the best tools.",
    }),
    (user) => ({
      title: "One concept, three formats",
      summary: `Document how you spin a single idea into a long-form video, a Short, and a community post—and the metrics each produced.`,
      focusKeyword: "content remix",
      supportingPoints: [
        "Share the exact scripts or captions that resonated most.",
        "Compare retention curves or click-through rates to surface insights.",
        "Encourage viewers to run the same experiment and report back.",
      ],
      trendSignal: "Algorithm updates reward creators who diversify distribution.",
    }),
  ],
}

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

  if (ideas.length >= count) {
    return ideas
  }

  const remaining = count - ideas.length
  const fallback = buildFallbackIdeas(detectChannelNiche(user, videos), user, context, remaining, ideas.length)

  return [...ideas, ...fallback].slice(0, count)
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

function buildFallbackIdeas(
  niche: ChannelNiche,
  user: User,
  context: { uploadTimes: string[]; estimatedBaseline: number },
  count: number,
  offset: number,
): DailyIdea[] {
  const templates = FALLBACK_TEMPLATES[niche]
  const ideas: DailyIdea[] = []
  const baseScore = niche === "tech" ? 78 : niche === "business" ? 75 : niche === "lifestyle" ? 72 : 73

  for (let index = 0; index < count; index++) {
    const template = templates[index % templates.length]
    const payload = template(user)
    const score = clamp(baseScore - index * 3, 64, 86)
    const confidence = score >= 80 ? "High" : score >= 68 ? "Medium" : "Emerging"
    ideas.push({
      id: `daily-fallback-${niche}-${offset + index}`,
      title: payload.title,
      summary: payload.summary,
      focusKeyword: payload.focusKeyword,
      confidence,
      score,
      projectedViews: Math.max(
        800,
        Math.round(context.estimatedBaseline * (1 + (score - 62) / 110)),
      ),
      engagementBoost: Math.max(6, Math.round((score - 50) * 0.55)),
      recommendedUploadTime:
        context.uploadTimes[(offset + index) % context.uploadTimes.length],
      supportingPoints: payload.supportingPoints,
      trendSignal: payload.trendSignal,
    })
  }

  return ideas
}

function detectChannelNiche(user: User, videos: Video[]): ChannelNiche {
  const corpus = `${user.channelName} ${user.description ?? ""} ${videos
    .map((video) => video.title)
    .join(" ")}`
    .toLowerCase()

  if (/(code|developer|program|tech|software|saas|automation|ai|data)/.test(corpus)) {
    return "tech"
  }

  if (/(finance|invest|startup|marketing|agency|sales|business|entrepreneur)/.test(corpus)) {
    return "business"
  }

  if (/(fitness|wellness|health|vlog|travel|beauty|lifestyle|minimal)/.test(corpus)) {
    return "lifestyle"
  }

  return "creator"
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
