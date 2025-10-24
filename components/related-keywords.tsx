"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const relatedKeywordsData = [
  { keyword: "react hooks tutorial", volume: 12500, competition: 65, score: 88 },
  { keyword: "usestate useffect", volume: 8900, competition: 72, score: 85 },
  { keyword: "custom hooks react", volume: 6200, competition: 58, score: 82 },
  { keyword: "react hooks best practices", volume: 5400, competition: 68, score: 80 },
  { keyword: "react hooks performance", volume: 4100, competition: 62, score: 78 },
  { keyword: "react hooks testing", volume: 3800, competition: 55, score: 81 },
]

export default function RelatedKeywords() {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((prev) => (prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]))
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Related Keywords</CardTitle>
        <CardDescription>Discover keywords related to your target terms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Enter a keyword to find related terms..." className="bg-input" />

        <div className="space-y-2">
          {relatedKeywordsData.map((item) => (
            <div
              key={item.keyword}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              onClick={() => toggleKeyword(item.keyword)}
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.keyword}</p>
                <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                  <span>Volume: {item.volume.toLocaleString()}</span>
                  <span>Competition: {item.competition}%</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">{item.score}</div>
                <input type="checkbox" checked={selectedKeywords.includes(item.keyword)} readOnly className="mt-2" />
              </div>
            </div>
          ))}
        </div>

        {selectedKeywords.length > 0 && (
          <Button className="w-full">Add {selectedKeywords.length} Keywords to Campaign</Button>
        )}
      </CardContent>
    </Card>
  )
}
