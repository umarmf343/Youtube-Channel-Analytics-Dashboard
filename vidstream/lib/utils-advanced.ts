// Advanced utility functions for VidIStream

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

export function calculateEngagementRate(likes: number, comments: number, views: number): number {
  return Math.round(((likes + comments) / views) * 100 * 100) / 100
}

export function calculateCTR(clicks: number, impressions: number): number {
  return Math.round((clicks / impressions) * 100 * 100) / 100
}

export function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  return { start, end }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100 * 100) / 100
}

export function generateKeywordSuggestions(baseKeyword: string): string[] {
  const modifiers = ["tutorial", "guide", "tips", "2025", "for beginners", "advanced", "examples", "best practices"]
  return modifiers.map((mod) => `${baseKeyword} ${mod}`)
}

export function estimateVideoLength(description: string): number {
  // Rough estimate: 1 minute per 150 words
  const wordCount = description.split(/\s+/).length
  return Math.ceil(wordCount / 150)
}

export function getKeywordDifficulty(competition: number, volume: number): "Easy" | "Medium" | "Hard" {
  const score = competition * 0.6 + (volume / 1000) * 0.4
  if (score < 40) return "Easy"
  if (score < 70) return "Medium"
  return "Hard"
}
