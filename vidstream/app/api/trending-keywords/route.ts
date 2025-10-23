import { NextResponse } from "next/server"

import { fetchTrendingKeywordData } from "@/lib/server/youtube"
import { generateMockTrendingKeywords } from "@/lib/youtube-api"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")?.trim() || "technology"

  try {
    const keywords = await fetchTrendingKeywordData(category)
    if (!keywords.length) {
      throw new Error("No trending keywords returned")
    }

    return NextResponse.json({ keywords })
  } catch (error) {
    console.error("[trending-keywords] Falling back to mock data", error)
    return NextResponse.json({ keywords: generateMockTrendingKeywords(category) })
  }
}

