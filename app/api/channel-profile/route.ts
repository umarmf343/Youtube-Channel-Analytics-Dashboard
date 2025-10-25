import { NextResponse } from "next/server"

import { fetchChannelProfile } from "@/lib/server/youtube"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")?.trim()

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 })
  }

  try {
    const profile = await fetchChannelProfile(query)
    return NextResponse.json(profile)
  } catch (error) {
    console.error("[channel-profile] Unable to fetch live data", error)
    return NextResponse.json({ error: "Failed to load channel profile" }, { status: 502 })
  }
}
