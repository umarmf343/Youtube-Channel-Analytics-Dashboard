import { NextResponse } from "next/server"

import {
  MissingYouTubeApiKeyError,
  YouTubeQuotaExceededError,
  fetchChannelVideos,
} from "@/lib/server/youtube"

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

    if (error instanceof MissingYouTubeApiKeyError) {
      return NextResponse.json(
        {
          error: "Server is missing a YouTube API key. Add YOUTUBE_API_KEY to your environment configuration.",
        },
        { status: 500 },
      )
    }

    if (error instanceof YouTubeQuotaExceededError) {
      return NextResponse.json(
        {
          error: "YouTube API quota exceeded. Try again after the daily quota resets.",
        },
        { status: 429 },
      )
    }

    const message = error instanceof Error ? error.message : "Failed to load channel videos"

    return NextResponse.json({ error: message }, { status: 502 })
  }
}
