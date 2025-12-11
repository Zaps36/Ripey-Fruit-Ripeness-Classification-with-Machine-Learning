"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto w-full max-w-md px-4 py-10 md:py-12">
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Contact</h1>
        <p className="mt-2 text-muted-foreground">Questions or feedback? Send us a note.</p>
        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" inputMode="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Tell us how we can help" required />
          </div>
          <Button type="submit" className="w-full">
            Send
          </Button>
        </form>
      </section>
      <SiteFooter />
    </main>
  )
}
