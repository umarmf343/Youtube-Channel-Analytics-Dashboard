import { NextResponse } from "next/server"

import { fetchKeywordMetricsFromYouTube } from "@/lib/server/youtube"

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
    console.error("[keyword-data] Unable to fetch live data", error)
    return NextResponse.json({ error: "Failed to fetch keyword data" }, { status: 502 })
  }
}
