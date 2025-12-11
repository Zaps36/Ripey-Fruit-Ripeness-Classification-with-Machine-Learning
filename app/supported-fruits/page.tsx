import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Sparkles } from "lucide-react"

// Fruit data with emoji icons
const fruits = [
  { name: "Apple", icon: "🍎", description: "Red & Green varieties" },
  { name: "Banana", icon: "🍌", description: "Yellow tropical fruit" },
  { name: "Grape", icon: "🍇", description: "Purple & Green bunches" },
  { name: "Guava", icon: "🥭", description: "Tropical delicacy" },
  { name: "Orange", icon: "🍊", description: "Citrus classic" },
  { name: "Pomegranate", icon: "🥭", description: "Ruby red seeds" },
  { name: "Strawberry", icon: "🍓", description: "Sweet red berry" },
]

export default function SupportedFruitsPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto w-full max-w-4xl px-4 py-10 md:py-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            <span>7 Fruits Supported</span>
          </div>
          <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Supported Fruits
          </h1>
          <p className="mt-3 text-muted-foreground md:text-lg">
            Our AI model can detect and analyze ripeness for these fruits
          </p>
        </div>

        {/* Knowledge grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fruits.map((fruit) => (
            <div
              key={fruit.name}
              className="card-hover group rounded-2xl border bg-gradient-to-br from-card to-muted/30 p-6 text-center shadow-soft-lg transition-all"
            >
              <div className="mb-4 text-6xl transition-transform group-hover:scale-110">
                {fruit.icon}
              </div>
              <h3 className="text-xl font-bold">{fruit.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {fruit.description}
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>3 Ripeness Stages</span>
              </div>
            </div>
          ))}
        </div>

        {/* Info card */}
        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center shadow-soft">
          <p className="text-sm font-medium text-primary">
            🌱 More fruits coming soon as our model continues to improve
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
