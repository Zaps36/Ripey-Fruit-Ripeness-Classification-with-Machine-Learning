"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Spinner } from "@/components/ui/spinner"
import { useHistory } from "@/lib/history-store"
import { predictFruit, warmup } from "@/lib/api-client"
import { Camera, Leaf, RotateCcw, Upload } from "lucide-react"

export default function ScannerPage() {
  const router = useRouter()
  const { push } = useHistory()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [permission, setPermission] = useState<"idle" | "granted" | "denied">("idle")
  const [streaming, setStreaming] = useState(false)
  const [captured, setCaptured] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  // Warmup model/backend on mount
  useEffect(() => {
    warmup()
  }, [])

  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | null
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const startCamera = async () => {
    setError(null)
    setBusy(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setPermission("granted")
        setStreaming(true)
      }
    } catch (err) {
      setPermission("denied")
      setError("Camera access was denied. Please enable it in your browser settings.")
    } finally {
      setBusy(false)
    }
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach((t) => t.stop())
    setStreaming(false)
  }

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current
    const c = canvasRef.current
    const width = v.videoWidth
    const height = v.videoHeight
    if (!width || !height) return
    c.width = width
    c.height = height
    const ctx = c.getContext("2d")
    if (!ctx) return
    ctx.drawImage(v, 0, 0, width, height)
    const dataUrl = c.toDataURL("image/jpeg", 0.9)
    setCaptured(dataUrl)
    stopCamera()
  }

  const retake = () => {
    setCaptured(null)
    // Don't auto-start camera, let user choose again
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        setCaptured(result)
        setStreaming(false) // Ensure streaming is off
      }
    }
    reader.readAsDataURL(file)
  }

  // Helper function to parse the label into ripeness and fruit name
  const parseLabel = (label: string) => {
    // Extract ripeness level (first part before the fruit name)
    let ripeness = "Unknown";
    let fruitName = "Unknown Fruit";

    if (label.startsWith("Ripe")) {
      ripeness = "Ripe";
      fruitName = label.replace("Ripe", "");
    } else if (label.startsWith("Rotten")) {
      ripeness = "Rotten";
      fruitName = label.replace("Rotten", "");
    } else if (label.startsWith("Unripe")) {
      ripeness = "Unripe";
      fruitName = label.replace("Unripe", "");
    } else {
      // Fallback: try to extract any known ripeness levels
      const ripenessLevels = ["Ripe", "Rotten", "Unripe"];
      for (const level of ripenessLevels) {
        if (label.includes(level)) {
          ripeness = level;
          fruitName = label.replace(level, "");
          break;
        }
      }
    }

    return { ripeness, fruitName };
  }

  const analyzeAndSave = async () => {
    if (!captured || !canvasRef.current) return
    setAnalyzing(true)
    try {
      const response = await predictFruit(captured)

      if (response.error) {
        alert(`Prediction error: ${response.error}`)
        setAnalyzing(false)
        return
      }

      const { fruit, label, confidence } = response

      // Parse the label to get ripeness and fruit name
      const { ripeness, fruitName } = parseLabel(label);

      const id = globalThis.crypto && "randomUUID" in globalThis.crypto ? crypto.randomUUID() : String(Date.now())

      push({
        id,
        fruit: fruitName || fruit, // Use parsed fruit name or fallback to API response
        score: confidence,
        label: ripeness, // Use the parsed ripeness level

        createdAt: Date.now(),
        previewDataUrl: captured,
      } as any)

      router.push("/history?added=1")
    } catch (e) {
      console.error("[v0] analyzeAndSave error:", (e as Error)?.message)
      alert("Could not analyze image. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Full-height scanner section */}
      <section className="relative flex flex-1 flex-col">
        {/* Hero text at top */}
        <div className="mx-auto w-full max-w-md px-4 py-6 md:py-8">
          <h1 className="text-balance text-2xl font-bold tracking-tight md:text-3xl">
            Fruit Scanner
          </h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Point your camera at a fruit to analyze its ripeness
          </p>
        </div>

        {/* Camera viewfinder - takes remaining space */}
        <div className="relative mx-auto w-full max-w-md flex-1 px-4">
          <div className="relative h-full min-h-[400px] overflow-hidden rounded-2xl border-2 border-border shadow-soft-xl">
            {!captured ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                  aria-label="Live camera preview"
                />

                {/* Animated scanning overlay when camera is active */}
                {streaming && (
                  <div className="scanning-overlay">
                    <div className="scanning-line" />
                    {/* Corner frame indicators */}
                    <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-primary" />
                    <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-primary" />
                    <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-primary" />
                    <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-primary" />
                  </div>
                )}

                {/* Idle state - CSS icon instead of image */}
                {!streaming && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
                    <div className="relative">
                      <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/10" />
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                        <Camera className="h-12 w-12 text-primary" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">Ready to Scan</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Tap the button below to start
                      </p>
                    </div>
                    <Leaf className="absolute bottom-8 right-8 h-16 w-16 rotate-12 text-primary/20" />
                  </div>
                )}
              </>
            ) : (
              <div className="relative h-full">
                <img
                  src={captured}
                  alt="Captured frame preview"
                  className="h-full w-full object-cover"
                />
                {/* Success overlay after capture */}
                <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-background/80 to-transparent px-4 py-3">
                  <p className="text-sm font-medium text-foreground">✓ Frame Captured</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
          </div>
        </div>

        {/* Floating control bar with glassmorphism */}
        <div className="mx-auto w-full max-w-md px-4 py-6">
          <div className="glass relative overflow-hidden rounded-2xl border border-border/50 p-4 shadow-soft-lg">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />

            <div className="relative">
              {!streaming && !captured && (
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={startCamera}
                    disabled={busy}
                    size="lg"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-soft"
                  >
                    {busy ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="size-5" />
                        <span>Starting camera…</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        <span>Start Camera</span>
                      </span>
                    )}
                  </Button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase">Or</span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  <Button
                    onClick={triggerFileUpload}
                    variant="outline"
                    size="lg"
                    className="w-full bg-background/50 hover:bg-background/80 transition-all duration-200"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      <span>Upload Photo</span>
                    </span>
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />

                  {permission === "denied" && (
                    <p className="text-center text-sm text-destructive">{error}</p>
                  )}
                </div>
              )}

              {streaming && (
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={stopCamera}
                    size="lg"
                    className="flex-1 bg-background/50 hover:bg-background/80 transition-all duration-200"
                  >
                    Stop
                  </Button>

                  {/* Shutter button */}
                  <button
                    onClick={captureFrame}
                    className="shutter-button flex-shrink-0"
                    aria-label="Capture frame"
                  >
                    <span className="sr-only">Capture</span>
                  </button>

                  <div className="flex-1" /> {/* Spacer for centering */}
                </div>
              )}

              {captured && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={retake}
                    variant="outline"
                    size="lg"
                    className="flex-1 bg-background/50 hover:bg-background/80 transition-all duration-200"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retake
                  </Button>
                  <Button
                    onClick={analyzeAndSave}
                    disabled={analyzing}
                    size="lg"
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-soft"
                  >
                    {analyzing ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="size-5" />
                        <span>Analyzing…</span>
                      </span>
                    ) : (
                      "Analyze & Save"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}