import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function PrivacyPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto w-full max-w-2xl px-4 py-10 md:py-12">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">
          We value privacy. This app is designed to run scans on-device. Account and history features will be
          implemented with care.
        </p>
        <div className="prose mt-6 max-w-none dark:prose-invert">
          <h2>Data</h2>
          <p>
            We collect minimal data necessary to provide history syncing. Images and metadata remain under your control.
          </p>
          <h2>Contact</h2>
          <p>If you have questions, visit the Contact page.</p>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
