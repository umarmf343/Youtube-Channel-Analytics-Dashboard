import { NextResponse } from "next/server"

import { generateDailyVideoIdeas } from "@/lib/server/youtube"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const channelId = searchParams.get("channelId")?.trim()
  const channelName = searchParams.get("channelName")?.trim() || undefined
  const focus = searchParams.get("focus")?.trim() || undefined

  if (!channelId) {
    return NextResponse.json({ error: "channelId is required" }, { status: 400 })
  }

  try {
    const ideas = await generateDailyVideoIdeas({ channelId, channelName, focus })
    return NextResponse.json({ ideas })
  } catch (error) {
    console.error("[daily-ideas] Failed to deliver ideas", error)
    return NextResponse.json({ error: "Unable to generate daily video ideas" }, { status: 502 })
  }
}
