"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const trendData = [
  { month: "Jan", "React Hooks": 45, "Vue Composition": 32, "Angular RxJS": 28 },
  { month: "Feb", "React Hooks": 52, "Vue Composition": 35, "Angular RxJS": 26 },
  { month: "Mar", "React Hooks": 48, "Vue Composition": 38, "Angular RxJS": 24 },
  { month: "Apr", "React Hooks": 61, "Vue Composition": 42, "Angular RxJS": 22 },
  { month: "May", "React Hooks": 55, "Vue Composition": 45, "Angular RxJS": 20 },
  { month: "Jun", "React Hooks": 67, "Vue Composition": 48, "Angular RxJS": 18 },
  { month: "Jul", "React Hooks": 72, "Vue Composition": 52, "Angular RxJS": 16 },
  { month: "Aug", "React Hooks": 68, "Vue Composition": 55, "Angular RxJS": 14 },
  { month: "Sep", "React Hooks": 75, "Vue Composition": 58, "Angular RxJS": 12 },
  { month: "Oct", "React Hooks": 82, "Vue Composition": 62, "Angular RxJS": 10 },
]

export default function InterestOverTime() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Interest Over Time</CardTitle>
        <CardDescription>Track keyword popularity trends over the past 10 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }} />
            <Legend />
            <Line type="monotone" dataKey="React Hooks" stroke="var(--color-chart-1)" strokeWidth={2} />
            <Line type="monotone" dataKey="Vue Composition" stroke="var(--color-chart-2)" strokeWidth={2} />
            <Line type="monotone" dataKey="Angular RxJS" stroke="var(--color-chart-3)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
