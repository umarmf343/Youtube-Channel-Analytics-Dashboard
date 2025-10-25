import { NextResponse } from "next/server"

import { fetchCompetitorKeywordInsights } from "@/lib/server/youtube"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get("channel")?.trim()

  if (!channel) {
    return NextResponse.json({ error: "Missing channel parameter" }, { status: 400 })
  }

  try {
    const keywords = await fetchCompetitorKeywordInsights(channel)
    return NextResponse.json({ keywords })
  } catch (error) {
    console.error("[competitor-keywords] Unable to fetch live data", error)
    return NextResponse.json({ error: "Failed to fetch competitor keywords" }, { status: 502 })
  }
}
