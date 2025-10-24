"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const templates = [
  { id: 1, name: "Web Development Basics", keywords: ["HTML", "CSS", "JavaScript", "Web Design"] },
  { id: 2, name: "React Advanced", keywords: ["React Hooks", "Context API", "Performance", "Testing"] },
  { id: 3, name: "Full Stack", keywords: ["Frontend", "Backend", "Database", "DevOps"] },
]

export default function KeywordTemplates() {
  const [newTemplate, setNewTemplate] = useState("")
  const [savedTemplates, setSavedTemplates] = useState(templates)

  const handleSaveTemplate = () => {
    if (newTemplate.trim()) {
      setSavedTemplates([...savedTemplates, { id: Date.now(), name: newTemplate, keywords: [] }])
      setNewTemplate("")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create Template */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Create Template</CardTitle>
          <CardDescription>Save keyword groups for quick reuse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Template name..."
            value={newTemplate}
            onChange={(e) => setNewTemplate(e.target.value)}
            className="bg-input"
          />
          <Button onClick={handleSaveTemplate} className="w-full">
            Create Template
          </Button>
        </CardContent>
      </Card>

      {/* Saved Templates */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Saved Templates</CardTitle>
          <CardDescription>{savedTemplates.length} templates available</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {savedTemplates.map((template) => (
            <div key={template.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <p className="font-medium text-foreground">{template.name}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {template.keywords.map((kw) => (
                  <span key={kw} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                    {kw}
                  </span>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-2 w-full bg-transparent">
                Use Template
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
