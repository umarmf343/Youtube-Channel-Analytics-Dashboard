"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const controversialKeywords = [
  { keyword: "clickbait", risk: "High", reason: "Can trigger demonetization" },
  { keyword: "fake news", risk: "High", reason: "Misinformation policy" },
  { keyword: "conspiracy", risk: "Medium", reason: "May limit monetization" },
  { keyword: "violence", risk: "High", reason: "Advertiser-friendly content" },
  { keyword: "hate speech", risk: "High", reason: "Community guidelines" },
]

export default function ControversialKeywordsChecker() {
  const [keywords, setKeywords] = useState("")
  const [results, setResults] = useState<typeof controversialKeywords>([])

  const handleCheck = () => {
    const keywordList = keywords
      .toLowerCase()
      .split(",")
      .map((k) => k.trim())
    const flagged = controversialKeywords.filter((item) => keywordList.some((k) => k.includes(item.keyword)))
    setResults(flagged)
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Controversial Keywords Checker</CardTitle>
        <CardDescription>Identify keywords that could trigger demonetization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Enter Keywords</label>
          <Input
            placeholder="Enter keywords separated by commas..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="bg-input"
          />
        </div>

        <Button onClick={handleCheck} className="w-full">
          Check Keywords
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Flagged Keywords</h3>
            {results.map((item) => (
              <div
                key={item.keyword}
                className={`p-3 rounded-lg border-l-4 ${item.risk === "High" ? "bg-red-50 dark:bg-red-950 border-red-500" : "bg-yellow-50 dark:bg-yellow-950 border-yellow-500"}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-foreground">{item.keyword}</p>
                    <p className="text-sm text-muted-foreground">{item.reason}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${item.risk === "High" ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800"}`}
                  >
                    {item.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
