"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockKeywords } from "@/lib/mock-data"
import type { Keyword } from "@/lib/types"

export default function KeywordInspector() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(mockKeywords[0])

  const filteredKeywords = mockKeywords.filter((k) => k.term.toLowerCase().includes(searchTerm.toLowerCase()))

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "Easy") return "bg-green-100 text-green-800"
    if (difficulty === "Medium") return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Search & List */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Keyword Inspector</CardTitle>
            <CardDescription>Analyze search volume and competition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input"
            />

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredKeywords.map((keyword) => (
                <button
                  key={keyword.id}
                  onClick={() => setSelectedKeyword(keyword)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedKeyword?.id === keyword.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <p className="font-medium truncate">{keyword.term}</p>
                  <p
                    className={`text-sm ${selectedKeyword?.id === keyword.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                  >
                    Score: {keyword.score}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      {selectedKeyword && (
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">{selectedKeyword.term}</CardTitle>
              <CardDescription>Detailed keyword analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Search Volume</p>
                  <p className="text-2xl font-bold text-foreground">{selectedKeyword.searchVolume.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Competition</p>
                  <p className="text-2xl font-bold text-foreground">{selectedKeyword.competition}%</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Trend</p>
                  <p className="text-2xl font-bold text-foreground">{selectedKeyword.trend}%</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(selectedKeyword.score)}`}>
                    {selectedKeyword.score}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Difficulty</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedKeyword.difficulty)}`}
                  >
                    {selectedKeyword.difficulty}
                  </span>
                </div>
              </div>

              {/* Related Keywords */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Related Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedKeyword.relatedKeywords.map((keyword) => (
                    <span key={keyword} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  This is a high-opportunity keyword. Consider creating content around this term to capture search
                  traffic.
                </p>
              </div>

              <Button className="w-full">Add to Campaign</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
