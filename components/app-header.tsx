"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/", label: "Home" },
  { href: "/scanner", label: "Scan" },
  { href: "/history", label: "History" },
  { href: "/supported-fruits", label: "Fruits" },
]

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-screen-sm px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">
            Fruit Ripeness
            <span className="sr-only">Home</span>
          </Link>

          <nav aria-label="Primary" className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant={pathname === "/" ? "default" : "outline"}
                size="sm"
                aria-current={pathname === "/" ? "page" : undefined}
              >
                Home
              </Button>
            </Link>
            <Link href="/scanner">
              <Button
                variant={pathname === "/scanner" ? "default" : "outline"}
                size="sm"
                aria-current={pathname === "/scanner" ? "page" : undefined}
              >
                Scan
              </Button>
            </Link>
            <Link href="/history">
              <Button
                variant={pathname === "/history" ? "default" : "outline"}
                size="sm"
                aria-current={pathname === "/history" ? "page" : undefined}
              >
                History
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
