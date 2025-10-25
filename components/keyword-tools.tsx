"use client"

import RealTimeKeywordResearch from "@/components/real-time-keyword-research"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function KeywordTools() {
  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Keyword Research &amp; SEO Tools</CardTitle>
          <CardDescription>
            Benchmark the essentials every creator expects from leading suites like VidIQ.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            VidIQ popularized a data-backed workflow for finding high-impact opportunities. Creators look for the
            same foundation inside VidIStream so they can confidently shape titles, descriptions, and tags that
            perform.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Keyword scores that balance demand and difficulty to highlight the best publishing angles.
            </li>
            <li>
              Search volume snapshots that surface high-traffic, low-competition phrases worth targeting.
            </li>
            <li>Smart tag suggestions to round out metadata and reinforce topic relevance.</li>
          </ul>
        </CardContent>
      </Card>

      <RealTimeKeywordResearch />
    </div>
  )
}
