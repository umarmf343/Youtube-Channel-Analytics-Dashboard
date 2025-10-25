import { NextResponse } from "next/server"

import { generateDailyVideoIdeas } from "@/lib/server/daily-ideas"

export const dynamic = "force-dynamic"

function parseNumber(value: string | null): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  if (Number.isFinite(parsed)) {
    return parsed
  }
  return undefined
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const niche = searchParams.get("niche")?.trim() || "technology"
  const engagement = (searchParams.get("engagement")?.toLowerCase() ?? "medium") as "low" | "medium" | "high"
  const subscribers = parseNumber(searchParams.get("subscribers"))
  const averageViews = parseNumber(searchParams.get("averageViews"))
  const channelName = searchParams.get("channelName")?.slice(0, 120)

  try {
    const ideas = generateDailyVideoIdeas({
      niche,
      engagement: ["low", "medium", "high"].includes(engagement) ? engagement : "medium",
      subscribers,
      averageViews,
      channelName,
    })

    return NextResponse.json({ ideas })
  } catch (error) {
    console.error("[daily-ideas] Failed to generate ideas", error)
    return NextResponse.json({ error: "Failed to generate daily ideas" }, { status: 500 })
  }
}
