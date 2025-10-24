import { NextResponse } from "next/server"

import { fetchKeywordMetricsFromYouTube } from "@/lib/server/youtube"
import { generateMockKeywordData } from "@/lib/youtube-api"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get("keyword")?.trim()

  if (!keyword) {
    return NextResponse.json({ error: "Missing keyword parameter" }, { status: 400 })
  }

  try {
    const data = await fetchKeywordMetricsFromYouTube(keyword)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[keyword-data] Falling back to mock data", error)
    const fallback = generateMockKeywordData(keyword)
    return NextResponse.json(fallback, { status: 200 })
  }
}

