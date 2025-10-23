"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const languages = ["Spanish", "French", "German", "Japanese", "Chinese", "Portuguese", "Hindi", "Arabic"]

export default function TranslationTool() {
  const [title, setTitle] = useState("How to Master React Hooks in 2025")
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Original Content</CardTitle>
          <CardDescription>Enter your title, description, or tags</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-input" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
            <Textarea placeholder="Enter your video description..." className="bg-input min-h-32" />
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Select Languages</CardTitle>
          <CardDescription>Choose languages to translate to</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`p-3 rounded-lg transition-colors text-sm font-medium ${
                  selectedLanguages.includes(lang)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <Button className="w-full">Translate to {selectedLanguages.length} Languages</Button>
        </CardContent>
      </Card>

      {/* Translations */}
      {selectedLanguages.length > 0 && (
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Translations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedLanguages.map((lang) => (
              <Card key={lang} className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">{lang}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {lang === "Spanish" && "Cómo dominar React Hooks en 2025"}
                    {lang === "French" && "Comment maîtriser les React Hooks en 2025"}
                    {lang === "German" && "Wie man React Hooks 2025 beherrscht"}
                    {lang === "Japanese" && "2025年にReactフックをマスターする方法"}
                    {lang === "Chinese" && "如何在2025年掌握React Hooks"}
                    {lang === "Portuguese" && "Como dominar React Hooks em 2025"}
                    {lang === "Hindi" && "2025 में React Hooks में महारत हासिल करने का तरीका"}
                    {lang === "Arabic" && "كيفية إتقان React Hooks في 2025"}
                  </p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Copy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
