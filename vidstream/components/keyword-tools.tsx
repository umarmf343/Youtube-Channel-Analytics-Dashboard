"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import KeywordInspector from "@/components/keyword-inspector"
import RelatedKeywords from "@/components/related-keywords"
import InterestOverTime from "@/components/interest-over-time"
import KeywordTemplates from "@/components/keyword-templates"
import TranslationTool from "@/components/translation-tool"
import RealTimeKeywordResearch from "@/components/real-time-keyword-research"

export default function KeywordTools() {
  const [activeTab, setActiveTab] = useState("realtime")

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-muted">
          <TabsTrigger value="realtime">Real-Time</TabsTrigger>
          <TabsTrigger value="inspector">Inspector</TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="translate">Translate</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <RealTimeKeywordResearch />
        </TabsContent>

        <TabsContent value="inspector" className="space-y-4">
          <KeywordInspector />
        </TabsContent>

        <TabsContent value="related" className="space-y-4">
          <RelatedKeywords />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <InterestOverTime />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <KeywordTemplates />
        </TabsContent>

        <TabsContent value="translate" className="space-y-4">
          <TranslationTool />
        </TabsContent>
      </Tabs>
    </div>
  )
}
