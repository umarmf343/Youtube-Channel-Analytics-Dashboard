import { NextResponse } from "next/server"

import { analyzeCompetitors } from "@/lib/server/competitor-analysis"
import type { CompetitorAnalysisRequest } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body must be an object" }, { status: 400 })
  }

  const { channel, competitors } = body as Partial<CompetitorAnalysisRequest>

  if (!channel || typeof channel.channelName !== "string") {
    return NextResponse.json({ error: "Missing channel context" }, { status: 400 })
  }

  if (!Array.isArray(competitors)) {
    return NextResponse.json({ error: "Competitors must be an array" }, { status: 400 })
  }

  const sanitizedChannel: CompetitorAnalysisRequest["channel"] = {
    channelId: (channel.channelId ?? channel.id ?? "").toString().trim(),
    channelName: channel.channelName.trim(),
    subscribers: Number.isFinite(channel.subscribers as number)
      ? (channel.subscribers as number)
      : Number(channel.subscribers ?? 0),
    totalViews: Number.isFinite(channel.totalViews as number)
      ? (channel.totalViews as number)
      : Number(channel.totalViews ?? 0),
    id: typeof channel.id === "string" ? channel.id : undefined,
  }

  const sanitizedCompetitors = competitors.map((item) =>
    typeof item === "string" ? item : String(item ?? ""),
  )

  try {
    const analysis = await analyzeCompetitors({ channel: sanitizedChannel, competitors: sanitizedCompetitors })
    return NextResponse.json(analysis)
  } catch (error) {
    console.error("[competitor-analysis] Unable to generate analysis", error)
    const message = error instanceof Error ? error.message : "Failed to generate competitor analysis"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
