import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function TermsPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto w-full max-w-2xl px-4 py-10 md:py-12">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Terms of Service</h1>
        <div className="prose mt-4 max-w-none dark:prose-invert">
          <p>
            Use this app at your discretion. We aim for accurate guidance, but results are not a substitute for common
            sense.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
