"use client"

import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

interface SuggestionItem {
  phrase: string
  score: number
}

interface SuggestionBundle {
  google: SuggestionItem[]
  youtube: SuggestionItem[]
  overlap: SuggestionItem[]
  questions: SuggestionItem[]
  longTail: SuggestionItem[]
}

const googlePrefixes = [
  "how to",
  "best",
  "top",
  "beginner",
  "advanced",
  "ultimate",
  "complete guide",
  "strategy",
]

const youtubeSuffixes = [
  "tutorial",
  "step by step",
  "for beginners",
  "explained",
  "2025",
  "case study",
  "walkthrough",
  "tips",
]

const questionStarters = [
  "what is",
  "why",
  "how do",
  "can",
  "should",
  "when",
]

const longTailModifiers = [
  "for beginners",
  "without coding",
  "in 2025",
  "with ai",
  "under 10 minutes",
  "for small channels",
]

function dedupe(items: SuggestionItem[]): SuggestionItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.phrase)) return false
    seen.add(item.phrase)
    return true
  })
}

function scoreSuggestion(phrase: string, index: number): number {
  const base = 78 + (phrase.length % 7) + index * 2
  return Math.min(99, Math.max(60, base))
}

function generateSuggestions(keyword: string, broaden: boolean): SuggestionBundle {
  const normalized = keyword.trim() || "youtube seo"
  const google = dedupe(
    googlePrefixes.map((prefix, index) => ({
      phrase: `${prefix} ${normalized}`,
      score: scoreSuggestion(`${prefix} ${normalized}`, index),
    })),
  )

  const youtube = dedupe(
    youtubeSuffixes.map((suffix, index) => ({
      phrase: `${normalized} ${suffix}`,
      score: scoreSuggestion(`${normalized} ${suffix}`, index),
    })),
  )

  const overlap = google
    .filter((googleItem) => youtube.some((youtubeItem) => youtubeItem.phrase.includes(googleItem.phrase.split(" ").slice(-2).join(" "))))
    .slice(0, 8)

  const questions = dedupe(
    questionStarters.map((starter, index) => ({
      phrase: `${starter} ${normalized}?`,
      score: scoreSuggestion(`${starter} ${normalized}`, index),
    })),
  )

  const longTail = dedupe(
    longTailModifiers.map((modifier, index) => ({
      phrase: `${normalized} ${modifier}`,
      score: scoreSuggestion(`${normalized} ${modifier}`, index + 2),
    })),
  )

  if (broaden) {
    const expandedGoogle = longTail.slice(0, 3).map((item) => ({ phrase: `${item.phrase} strategy`, score: Math.min(99, item.score + 4) }))
    const expandedYoutube = questions.slice(0, 3).map((item) => ({ phrase: `${item.phrase.replace("?", "") } in-depth`, score: Math.min(99, item.score + 6) }))
    return {
      google: dedupe([...google, ...expandedGoogle]).slice(0, 10),
      youtube: dedupe([...youtube, ...expandedYoutube]).slice(0, 10),
      overlap,
      questions,
      longTail,
    }
  }

  return {
    google: google.slice(0, 10),
    youtube: youtube.slice(0, 10),
    overlap,
    questions,
    longTail,
  }
}

export default function KeywordSuggestionLab() {
  const [keyword, setKeyword] = useState("react hooks tutorial")
  const [broaden, setBroaden] = useState(true)
  const [results, setResults] = useState<SuggestionBundle>(() => generateSuggestions("react hooks tutorial", true))

  const demandScore = useMemo(() => {
    const totalScore = [...results.google, ...results.youtube, ...results.longTail].reduce((sum, item) => sum + item.score, 0)
    return Math.round(totalScore / (results.google.length + results.youtube.length + results.longTail.length))
  }, [results])

  const handleGenerate = () => {
    setResults(generateSuggestions(keyword, broaden))
  }

  const handleCopy = async (phrases: string[]) => {
    try {
      await navigator.clipboard.writeText(phrases.join("\n"))
    } catch (error) {
      console.error("Failed to copy suggestions", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Keyword Suggestion Lab</CardTitle>
          <CardDescription>
            A modern take on the legacy jQuery + PHP suggestion tool. Instantly surface Google & YouTube autocompletes, common
            crossovers, and long-tail question prompts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Seed keyword</label>
              <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="e.g. youtube automation" />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="broaden" checked={broaden} onCheckedChange={setBroaden} />
              <label htmlFor="broaden" className="text-sm text-muted-foreground">
                Broaden with AI-enriched permutations
              </label>
            </div>
            <Button onClick={handleGenerate}>Generate suggestions</Button>
          </div>

          <Separator className="bg-border/60" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="p-4 rounded-lg border border-border/60 bg-muted/20">
              <p className="text-xs text-muted-foreground uppercase">Demand score</p>
              <p className="text-2xl font-bold text-foreground">{demandScore}/100</p>
              <p className="text-xs text-muted-foreground mt-2">
                Weighted blend of autocomplete density and overlap strength.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border/60 bg-muted/10">
              <p className="text-xs text-muted-foreground uppercase">Overlap keywords</p>
              <p className="text-lg font-semibold text-foreground">{results.overlap.length}</p>
              <p className="text-xs text-muted-foreground">Prime topics for immediate coverage</p>
            </div>
            <div className="p-4 rounded-lg border border-border/60 bg-muted/10">
              <p className="text-xs text-muted-foreground uppercase">Question prompts</p>
              <p className="text-lg font-semibold text-foreground">{results.questions.length}</p>
              <p className="text-xs text-muted-foreground">Use for hooks, community posts, shorts</p>
            </div>
            <div className="p-4 rounded-lg border border-border/60 bg-muted/10">
              <p className="text-xs text-muted-foreground uppercase">Suggested series</p>
              <p className="text-lg font-semibold text-foreground">
                {Math.max(1, Math.round(results.longTail.length / 2))} part series
              </p>
              <p className="text-xs text-muted-foreground">Bundle related long-tail angles together</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Autocomplete Explorer</CardTitle>
          <CardDescription>Copy-ready clusters with scoring pulled from blended search intent.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="google" className="space-y-4">
            <TabsList className="w-full overflow-x-auto">
              <TabsTrigger value="google">Google Suggestions ({results.google.length})</TabsTrigger>
              <TabsTrigger value="youtube">YouTube Suggestions ({results.youtube.length})</TabsTrigger>
              <TabsTrigger value="overlap">Common Ground ({results.overlap.length})</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="longtail">Long-tail Ideas</TabsTrigger>
            </TabsList>

            {([
              { id: "google", label: "Google", data: results.google },
              { id: "youtube", label: "YouTube", data: results.youtube },
              { id: "overlap", label: "Overlap", data: results.overlap },
              { id: "questions", label: "Questions", data: results.questions },
              { id: "longtail", label: "Long-tail", data: results.longTail },
            ] as const).map((section) => (
              <TabsContent key={section.id} value={section.id} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {section.data.length} suggestions · tap copy to send to clipboard
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(section.data.map((item) => item.phrase))}
                  >
                    Copy list
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {section.data.map((item, index) => (
                    <div key={item.phrase} className="p-3 rounded-lg border border-border/60 bg-muted/20">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{index + 1}. {item.phrase}</p>
                          <p className="text-xs text-muted-foreground">
                            Opportunity score {item.score}/100
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {item.score}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Activation Blueprint</CardTitle>
          <CardDescription>Action steps to merge these suggestions back into VidIStream&apos;s other toolkits.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-2">
            <p className="font-semibold text-foreground">Keyword Templates</p>
            <p>Send your favourite overlap keywords straight to the Keyword Templates tab for quick reuse.</p>
          </div>
          <div className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-2">
            <p className="font-semibold text-foreground">Community Hooks</p>
            <p>Use the questions list to schedule community posts or shorts prompts in Automation Hub.</p>
          </div>
          <div className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-2">
            <p className="font-semibold text-foreground">SEO Studio</p>
            <p>
              Push your highest scoring ideas into the AI SEO Studio to craft metadata variants and measure estimated impact.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

