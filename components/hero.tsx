import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-28">
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
          Ripey
        </h1>
        <p className="mt-4 text-balance text-lg text-muted-foreground md:text-xl">
          Instant fruit ripeness detection powered by AI.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Button asChild size="lg" className="shadow-soft">
          <a href="/scanner">Start scanning</a>
        </Button>
        <Button variant="ghost" asChild size="lg">
          <a href="#features">Learn more</a>
        </Button>
      </div>

      {/* Interactive App Preview Mockup */}
      <div className="mt-16 overflow-hidden rounded-2xl border-2 shadow-soft-xl">
        <div className="bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
          {/* Mock Phone Frame */}
          <div className="mx-auto max-w-sm overflow-hidden rounded-3xl border-8 border-foreground/10 bg-background shadow-soft-xl">
            {/* Status Bar */}
            <div className="flex items-center justify-between bg-background px-6 py-2 text-xs">
              <span className="font-medium">9:41</span>
              <div className="flex gap-1">
                <div className="h-1 w-4 rounded-full bg-foreground/60" />
                <div className="h-1 w-1 rounded-full bg-foreground/60" />
              </div>
            </div>

            {/* Scanner Interface */}
            <div className="bg-background">
              {/* Header */}
              <div className="px-4 py-6">
                <h2 className="text-2xl font-bold">Fruit Scanner</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Point your camera at a fruit to analyze
                </p>
              </div>

              {/* Camera Viewfinder with Mock Fruit */}
              <div className="relative mx-4 mb-4 aspect-square overflow-hidden rounded-2xl border-2 border-border bg-gradient-to-br from-emerald-50 to-yellow-50">
                {/* Mock Banana Image (using large emoji) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="animate-pulse text-[120px] md:text-[160px]">🍌</span>
                </div>

                {/* Scanning Animation */}
                <div className="scanning-overlay">
                  <div className="scanning-line" />
                  {/* Corner Indicators */}
                  <div className="absolute left-4 top-4 h-8 w-8 border-l-3 border-t-3 border-primary" style={{ borderWidth: '3px' }} />
                  <div className="absolute right-4 top-4 h-8 w-8 border-r-3 border-t-3 border-primary" style={{ borderWidth: '3px' }} />
                  <div className="absolute bottom-4 left-4 h-8 w-8 border-b-3 border-l-3 border-primary" style={{ borderWidth: '3px' }} />
                  <div className="absolute bottom-4 right-4 h-8 w-8 border-b-3 border-r-3 border-primary" style={{ borderWidth: '3px' }} />
                </div>

                {/* Prediction Result Badge */}
                <div className="absolute left-1/2 top-4 -translate-x-1/2 transform rounded-full bg-background/90 px-4 py-2 backdrop-blur-sm">
                  <span className="badge-ripe text-xs font-semibold">Ripe Banana</span>
                </div>
              </div>

              {/* Control Panel */}
              <div className="px-4 pb-6">
                <div className="glass relative overflow-hidden rounded-2xl border border-border/50 p-4 shadow-soft-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                  <div className="relative flex items-center justify-center gap-4">
                    <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/50 text-muted-foreground transition-all hover:bg-background/80">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M3 9h18" />
                      </svg>
                    </button>

                    {/* Shutter Button */}
                    <div className="shutter-button flex-shrink-0">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    <div className="h-12 w-12" /> {/* Spacer */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
