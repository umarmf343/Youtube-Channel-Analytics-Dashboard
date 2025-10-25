import { NextResponse } from "next/server"

import { fetchTrendingKeywordData } from "@/lib/server/youtube"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")?.trim() || "technology"

  try {
    const keywords = await fetchTrendingKeywordData(category)
    return NextResponse.json({ keywords })
  } catch (error) {
    console.error("[trending-keywords] Unable to fetch live data", error)
    return NextResponse.json({ error: "Failed to fetch trending keywords" }, { status: 502 })
  }
}
