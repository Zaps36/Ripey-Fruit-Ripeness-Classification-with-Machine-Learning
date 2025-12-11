import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Hero } from "@/components/hero"

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <Hero />
      <section aria-labelledby="features" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <h2 id="features" className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
          Simple features. Serious utility.
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <article className="rounded-lg border bg-card p-5 transition-colors hover:bg-accent">
            <h3 className="text-lg font-medium">On‑device scan</h3>
            <p className="mt-2 text-muted-foreground">
              Private, fast predictions via TensorFlow.js—no upload required.
            </p>
          </article>
          <article className="rounded-lg border bg-card p-5 transition-colors hover:bg-accent">
            <h3 className="text-lg font-medium">History that matters</h3>
            <p className="mt-2 text-muted-foreground">Save scans to review freshness trends over time.</p>
          </article>
          <article className="rounded-lg border bg-card p-5 transition-colors hover:bg-accent">
            <h3 className="text-lg font-medium">Supported fruits</h3>
            <p className="mt-2 text-muted-foreground">
              A clear list of fruits and ripeness labels the model understands.
            </p>
          </article>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button asChild>
            <a href="/scanner">Open scanner</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/history">View history</a>
          </Button>
        </div>
      </section>

      <section aria-labelledby="cta" className="mx-auto max-w-6xl px-4 pb-20 md:pb-28">
        <div className="rounded-xl border bg-secondary p-8 md:p-12">
          <h2 id="cta" className="text-balance text-xl font-semibold md:text-2xl">
            Built for everyday use
          </h2>
          <p className="mt-2 max-w-prose text-muted-foreground">
            Minimal interface. Clear results. Strong privacy. Scan fruits and know when they’re perfect—at home or on
            the go.
          </p>
          <div className="mt-6">
            <Button asChild>
              <a href="/supported-fruits">See supported fruits</a>
            </Button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
