"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useHistory } from "@/lib/history-store"
import { formatScore, formatWhen } from "@/lib/format"
import shelf from "@/lib/shelf-life.json"
import { Trash2, Calendar, TrendingUp, Share2, Award, PieChart, Zap } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"

// Helper function to get shelf life info
const getShelfLifeInfo = (fruit: string, label: string) => {
  const key = `${label} ${fruit}`.trim()
  const info = (
    shelf as Record<string, { shelfLifeCounter: string; shelfLifeFridge: string; storageTip: string }>
  )[key]
  if (info) {
    return {
      counter: info.shelfLifeCounter,
      fridge: info.shelfLifeFridge,
      tip: info.storageTip,
    }
  }
  return null
}

// Helper to generate a shareable image with overlay text
const generateShareImage = async (item: any): Promise<File | null> => {
  if (!item.previewDataUrl) return null

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(null)
        return
      }

      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw original image
      ctx.drawImage(img, 0, 0)

      // Add gradient overlay at the bottom for text readability
      const gradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height)
      gradient.addColorStop(0, "transparent")
      gradient.addColorStop(0.4, "rgba(0, 0, 0, 0.6)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.9)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4)

      // Text settings
      const padding = canvas.width * 0.05
      const bottomPos = canvas.height - padding

      // 1. Fruit Name
      ctx.fillStyle = "#ffffff"
      ctx.font = `bold ${canvas.width * 0.08}px "Plus Jakarta Sans", sans-serif`
      ctx.shadowColor = "rgba(0,0,0,0.5)"
      ctx.shadowBlur = 4
      ctx.fillText(item.fruit, padding, bottomPos - canvas.width * 0.12)

      // 2. Ripeness Badge
      const label = item.label.toUpperCase()
      let badgeColor = "#059669" // Ripe (Emerald)
      if (label === "UNRIPE") badgeColor = "#fb923c" // Unripe (Orange)
      if (label === "ROTTEN") badgeColor = "#dc2626" // Rotten (Red)

      ctx.fillStyle = badgeColor
      ctx.font = `bold ${canvas.width * 0.04}px "Plus Jakarta Sans", sans-serif`
      const labelWidth = ctx.measureText(label).width
      const labelPadding = canvas.width * 0.02

      // Badge background
      ctx.fillStyle = badgeColor
      ctx.roundRect(padding, bottomPos - canvas.width * 0.09, labelWidth + labelPadding * 2, canvas.width * 0.06, 8)
      ctx.fill()

      // Badge text
      ctx.fillStyle = "#ffffff"
      ctx.shadowBlur = 0
      ctx.fillText(label, padding + labelPadding, bottomPos - canvas.width * 0.05)

      // 3. Confidence & Date
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.font = `${canvas.width * 0.035}px "Plus Jakarta Sans", sans-serif`
      const dateStr = new Date(item.createdAt).toLocaleDateString()
      const confStr = `${(item.score * 100).toFixed(0)}% Confidence`
      ctx.fillText(`${confStr} • ${dateStr}`, padding, bottomPos)

      // 4. Branding (Right side)
      ctx.textAlign = "right"
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.font = `italic ${canvas.width * 0.03}px "Plus Jakarta Sans", sans-serif`
      ctx.fillText("Scanned with Ripey", canvas.width - padding, bottomPos)

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `fruit-scan-${item.id}.jpg`, { type: "image/jpeg" })
          resolve(file)
        } else {
          resolve(null)
        }
      }, "image/jpeg", 0.9)
    }
    img.onerror = () => resolve(null)
    img.src = item.previewDataUrl
  })
}

export default function HistoryPage() {
  const params = useSearchParams()
  const added = params.get("added") === "1"
  const { data: history, clear, remove, getStats } = useHistory()

  const items = useMemo(() => history ?? [], [history])
  const stats = getStats()

  const handleDelete = (id: string, fruitName: string) => {
    remove(id)
  }

  const handleShare = async (item: any) => {
    const shareText = `I just scanned a ${item.fruit} and it's ${item.label}! Confidence: ${(item.score * 100).toFixed(1)}%`
    const shareUrl = window.location.origin
    const fullText = `${shareText}\n\nCheck it out at ${shareUrl}`

    const shareData: ShareData = {
      title: 'Fruit Scan Result',
      text: shareText,
      url: shareUrl,
    }

    try {
      if (navigator.share) {
        // Generate watermarked image
        const file = await generateShareImage(item)

        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: shareData.title,
            text: fullText,
          })
          return
        }

        // Fallback to text sharing
        await navigator.share({
          ...shareData,
          text: fullText
        })
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
        toast.success("Copied to clipboard!")
      }
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  return (
    <main className="min-h-screen pb-20">
      <SiteHeader />
      <section className="mx-auto w-full max-w-2xl px-4 py-10 md:py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-balance text-2xl font-bold tracking-tight md:text-3xl">
            Scan History
          </h1>
          {items && items.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="shadow-soft hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear all
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    scan history from this device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => clear()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <p className="mt-2 text-muted-foreground">
          Your scanned fruits with ripeness predictions and storage information
        </p>

        {added && (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary"
          >
            ✓ Prediction saved successfully
          </div>
        )}

        {/* Gamification Stats Cards */}
        {items && items.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-center shadow-soft">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs font-medium text-muted-foreground">Total Scans</div>
            </div>
            <div className="rounded-2xl border bg-gradient-to-br from-accent/10 to-accent/5 p-4 text-center shadow-soft">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent">
                <Award className="h-4 w-4" />
              </div>
              <div className="text-xl font-bold text-accent capitalize truncate px-1">{stats.favorite}</div>
              <div className="text-xs font-medium text-muted-foreground">Favorite</div>
            </div>
            <div className="rounded-2xl border bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4 text-center shadow-soft">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-600">
                <PieChart className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.ripeRatio}%</div>
              <div className="text-xs font-medium text-muted-foreground">Ripe Score</div>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-12 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center shadow-soft">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No scans yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start scanning fruits to build your history
            </p>
            <div className="mt-6">
              <Button asChild size="lg" className="shadow-soft">
                <a href="/scanner">Open Scanner</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {items.map((it) => {
              const info = getShelfLifeInfo(it.fruit, it.label)

              return (
                <article
                  key={it.id}
                  className="card-hover group rounded-2xl border bg-card p-4 shadow-soft-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Larger thumbnail with better styling */}
                    {it.previewDataUrl ? (
                      <div className="relative flex-shrink-0 overflow-hidden rounded-xl">
                        <img
                          src={it.previewDataUrl}
                          alt={`${it.fruit} preview`}
                          className="h-24 w-24 object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="h-24 w-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-muted to-muted/50" aria-hidden />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold capitalize truncate">
                              {it.fruit === "Unknown" ? "Fruit" : it.fruit}
                            </h3>
                            {/* Colored ripeness badges */}
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${it.label === "Ripe"
                                ? "badge-ripe" :
                                it.label === "Unripe"
                                  ? "badge-unripe" :
                                  "badge-rotten"
                                }`}
                              aria-label={`Ripeness: ${it.label}`}
                            >
                              {it.label}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center gap-1.5 cursor-help hover:text-foreground transition-colors">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    <span>{(it.score * 100).toFixed(0)}% confidence</span>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-sm font-medium">AI Confidence Score</p>
                                  <p className="text-xs text-muted-foreground max-w-[200px]">
                                    How confident the model is about this prediction
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <time dateTime={new Date(it.createdAt).toISOString()}>
                                {new Date(it.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </time>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleShare(it)}
                          >
                            <Share2 className="h-4 w-4" />
                            <span className="sr-only">Share</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete scan?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove this scan from your history.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => remove(it.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* Shelf-life information with improved styling */}
                      {info ? (
                        <div className="mt-4 grid grid-cols-1 gap-2 rounded-xl bg-muted/30 p-3 text-sm sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🧺</span>
                            <div>
                              <span className="block text-xs font-medium text-muted-foreground">Counter</span>
                              <span className="font-medium">{info.counter}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">❄️</span>
                            <div>
                              <span className="block text-xs font-medium text-muted-foreground">Fridge</span>
                              <span className="font-medium">{info.fridge}</span>
                            </div>
                          </div>
                          <div className="col-span-1 sm:col-span-2 mt-1 flex items-start gap-2 rounded-lg bg-background/50 p-2 text-xs text-muted-foreground">
                            <span className="mt-0.5">💡</span>
                            <span>{info.tip}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-3 text-xs text-muted-foreground italic">
                          No shelf-life data available for this prediction
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
            <Button
              variant="outline"
              onClick={clear}
              className="w-full border-destructive/30 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All History
            </Button>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  )
}