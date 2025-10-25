import { NextResponse } from "next/server"

import { fetchTrendAlertsData } from "@/lib/server/youtube"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const niche = searchParams.get("niche")?.trim() || "technology"

  try {
    const alerts = await fetchTrendAlertsData(niche)
    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("[trend-alerts] Unable to fetch alerts", error)
    return NextResponse.json({ error: "Failed to fetch trend alerts" }, { status: 502 })
  }
}
