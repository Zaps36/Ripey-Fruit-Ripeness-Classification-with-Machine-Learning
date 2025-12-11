"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  const { toast } = useToast()
  const { login, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState<{ message: string; type: 'email' | 'password' | 'general' } | null>(null)
  const [success, setSuccess] = useState(false)

  const clearError = () => {
    setError(null)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    // Basic validation
    if (!email || !password) {
      setError({
        message: "Please fill in all required fields.",
        type: 'general'
      })
      return
    }

    setIsLoggingIn(true)
    const result = await login(email, password)
    setIsLoggingIn(false)

    if (!result.success && result.error) {
      setError(result.error)
    } else if (result.success) {
      setSuccess(true)
    }
  }

  if (loading) {
    return (
      <main>
        <SiteHeader />
        <section className="mx-auto w-full max-w-md px-4 py-10 md:py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Spinner className="h-8 w-8" />
            <p className="text-sm text-muted-foreground">Checking authentication...</p>
          </div>
        </section>
        <SiteFooter />
      </main>
    )
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto w-full max-w-md px-4 py-10 md:py-12">
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Log in</h1>
        <p className="mt-2 text-muted-foreground">Access your scanning history across devices.</p>

        {/* Success Message */}
        {success && (
          <div className="mt-4 rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-800">Login successful! Redirecting...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm font-medium text-red-800">{error.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className={error?.type === 'email' ? 'text-red-600' : ''}>
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearError()
              }}
              placeholder="you@example.com"
              disabled={isLoggingIn}
              className={error?.type === 'email' ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {error?.type === 'email' && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className={error?.type === 'password' ? 'text-red-600' : ''}>
              Password *
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearError()
              }}
              placeholder="••••••••"
              disabled={isLoggingIn}
              className={error?.type === 'password' ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              minLength={6}
            />
            {error?.type === 'password' && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="h-4 w-4" /> Logging in...
              </span>
            ) : (
              "Log in"
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="text-center">
            <Link 
              href="/signup" 
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Don't have an account? Sign up
            </Link>
          </div>
          <div className="text-center">
            <Link 
              href="/" 
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}