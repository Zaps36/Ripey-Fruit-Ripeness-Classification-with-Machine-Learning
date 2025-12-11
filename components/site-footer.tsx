export function SiteFooter() {
  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 md:flex-row md:items-center md:py-10">
        <p className="text-sm font-medium text-muted-foreground">
          © {new Date().getFullYear()} FRU. All rights reserved.
        </p>
        <nav className="flex gap-6 text-sm">
          <a
            className="font-medium text-muted-foreground hover:text-primary transition-colors"
            href="/privacy"
          >
            Privacy
          </a>
          <a
            className="font-medium text-muted-foreground hover:text-primary transition-colors"
            href="/terms"
          >
            Terms
          </a>
          <a
            className="font-medium text-muted-foreground hover:text-primary transition-colors"
            href="/contact"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  )
}
