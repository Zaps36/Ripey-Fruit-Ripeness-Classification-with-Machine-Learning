"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { User, LogOut, UserCircle, History, Scan, Leaf } from "lucide-react"

import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  const { user, logout, loading } = useAuth()

  const handleLogout = () => {
    logout()
    // Redirect happens automatically in auth context
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 glass shadow-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 transition-all hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
            <img src="/ripey-logo.png" alt="Ripey" className="h-full w-full object-cover scale-150" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Ripey
          </span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <a href="/">Home</a>
          </Button>
          <Link
            className="text-sm font-medium text-muted-foreground hover:text-primary px-3 py-2 rounded-md transition-all hover:bg-primary/5"
            href="/scanner"
          >
            Scanner
          </Link>
          <Link
            className="text-sm font-medium text-muted-foreground hover:text-primary px-3 py-2 rounded-md transition-all hover:bg-primary/5"
            href="/history"
          >
            History
          </Link>
          <Link
            className="text-sm font-medium text-muted-foreground hover:text-primary px-3 py-2 rounded-md transition-all hover:bg-primary/5"
            href="/supported-fruits"
          >
            Fruits
          </Link>

          <ModeToggle />

          {loading ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 shadow-soft">
                  <UserCircle className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">
                    {user.name || user.email.split('@')[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="shadow-soft-lg">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/scanner" className="flex items-center gap-2 cursor-pointer">
                    <Scan className="h-4 w-4" />
                    Scan Fruit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/history" className="flex items-center gap-2 cursor-pointer">
                    <History className="h-4 w-4" />
                    My History
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <a href="/login">Log in</a>
              </Button>
              <Button size="sm" asChild className="shadow-soft">
                <a href="/signup">Sign up</a>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}