import { NextResponse } from "next/server"

import { fetchChannelVideos } from "@/lib/server/youtube"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const channelId = searchParams.get("channelId")?.trim()

  if (!channelId) {
    return NextResponse.json({ error: "Missing channelId parameter" }, { status: 400 })
  }

  try {
    const videos = await fetchChannelVideos(channelId)
    return NextResponse.json({ videos })
  } catch (error) {
    console.error("[channel-videos] Unable to fetch live data", error)
    return NextResponse.json({ error: "Failed to load channel videos" }, { status: 502 })
  }
}
