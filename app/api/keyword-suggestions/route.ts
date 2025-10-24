import { NextResponse } from "next/server"

import { fetchKeywordSuggestions } from "@/lib/server/youtube"
import { generateMockRelatedKeywords } from "@/lib/youtube-api"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get("keyword")?.trim()

  if (!keyword) {
    return NextResponse.json({ error: "Missing keyword parameter" }, { status: 400 })
  }

  try {
    const suggestions = await fetchKeywordSuggestions(keyword)
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("[keyword-suggestions] Falling back to mock data", error)
    return NextResponse.json({ suggestions: generateMockRelatedKeywords(keyword) })
  }
}

