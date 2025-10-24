"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/lib/types"
import { mockUser } from "@/lib/mock-data"

interface LoginPageProps {
  onLogin: (user: User) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      onLogin(mockUser)
    }
  }

  const handleDemoLogin = () => {
    onLogin(mockUser)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary mb-4">
            <span className="text-2xl font-bold text-primary-foreground">VI</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">VidIStream</h1>
          <p className="text-muted-foreground">The most powerful YouTube analytics tool</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your VidIStream account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <Button type="submit" className="w-full" disabled={!email || !password}>
                Sign In
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or continue with demo</span>
              </div>
            </div>

            <Button onClick={handleDemoLogin} variant="outline" className="w-full bg-transparent">
              Try Demo Account
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Demo credentials: any email/password combination
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { icon: "📊", label: "Analytics" },
            { icon: "🔍", label: "Keywords" },
            { icon: "🎯", label: "Optimization" },
          ].map((feature) => (
            <div key={feature.label} className="text-center">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <p className="text-xs text-muted-foreground">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
