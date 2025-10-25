import { NextResponse } from "next/server"

import { fetchTrendAlertFeed } from "@/lib/server/youtube"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")?.trim() || "technology"

  try {
    const alerts = await fetchTrendAlertFeed(category)
    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("[trend-alerts] Unable to fetch trend alerts", error)
    return NextResponse.json({ error: "Failed to fetch trend alerts" }, { status: 502 })
  }
}
