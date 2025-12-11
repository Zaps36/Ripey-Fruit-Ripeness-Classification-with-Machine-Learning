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

export default function SignupPage() {
  const { toast } = useToast()
  const { register } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSigningUp, setIsSigningUp] = useState(false)
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
        message: "Please fill in email and password.",
        type: 'general'
      })
      return
    }

    if (password.length < 6) {
      setError({
        message: "Password must be at least 6 characters long.",
        type: 'password'
      })
      return
    }

    setIsSigningUp(true)
    const result = await register(email, password, name)
    setIsSigningUp(false)

    if (!result.success && result.error) {
      setError(result.error)
    } else if (result.success) {
      setSuccess(true)
    }
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto w-full max-w-md px-4 py-10 md:py-12">
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Create account</h1>
        <p className="mt-2 text-muted-foreground">Start scanning and keep your history private.</p>

        {/* Success Message */}
        {success && (
          <div className="mt-4 rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-800">Account created successfully! Redirecting...</p>
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
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                clearError()
              }}
              placeholder="Your name"
              disabled={isSigningUp}
            />
          </div>

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
              disabled={isSigningUp}
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearError()
              }}
              placeholder="••••••••"
              disabled={isSigningUp}
              className={error?.type === 'password' ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
            {error?.type === 'password' && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSigningUp}>
            {isSigningUp ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="h-4 w-4" /> Creating account...
              </span>
            ) : (
              "Sign up"
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="text-center">
            <Link 
              href="/login" 
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Already have an account? Log in
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