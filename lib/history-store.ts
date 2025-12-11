"use client"

import useSWR from "swr"
import type { HistoryEntry } from "./types"
import { useAuth } from "./auth-context"

// Local storage functions (for fallback)
function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function getLocalHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return []
  return safeParse<HistoryEntry[]>(localStorage.getItem('local_history'), [])
}

function setLocalHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return
  localStorage.setItem('local_history', JSON.stringify(entries))
}

function addLocalEntry(entry: HistoryEntry) {
  const current = getLocalHistory()
  const next = [entry, ...current].slice(0, 200)
  setLocalHistory(next)
}

function removeLocalEntry(id: string) {
  const current = getLocalHistory()
  const next = current.filter(entry => entry.id !== id)
  setLocalHistory(next)
}

function clearLocalHistory() {
  setLocalHistory([])
}

export function useHistory() {
  const { user } = useAuth()
  const isAuthenticated = !!user

  // Fetcher for authenticated users
  const fetcher = async (url: string) => {
    const token = localStorage.getItem('access_token')
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch history')
    return response.json()
  }

  // Fetcher for unauthenticated users
  const localFetcher = async () => {
    return getLocalHistory()
  }

  const swr = useSWR<HistoryEntry[]>(
    isAuthenticated ? 'http://localhost:5000/api/history' : 'local_history',
    isAuthenticated ? fetcher : localFetcher,
    {
      fallbackData: [],
      revalidateOnFocus: true,
    }
  )

  const push = async (entry: HistoryEntry) => {
    if (isAuthenticated) {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:5000/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(entry),
      })

      if (response.ok) {
        swr.mutate()
      } else {
        throw new Error('Failed to save history')
      }
    } else {
      // Fallback to localStorage
      addLocalEntry(entry)
      swr.mutate([entry, ...(swr.data || [])], { revalidate: false })
    }
  }

  const remove = async (id: string) => {
    if (isAuthenticated) {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`http://localhost:5000/api/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })

      if (response.ok) {
        swr.mutate()
      } else {
        throw new Error('Failed to delete history')
      }
    } else {
      // Fallback to localStorage
      removeLocalEntry(id)
      swr.mutate((swr.data || []).filter(entry => entry.id !== id), { revalidate: false })
    }
  }

  const clear = async () => {
    if (isAuthenticated) {
      // For authenticated users, we'll clear the local cache
      // You might want to add a clear-all endpoint in the future
      swr.mutate([], { revalidate: false })
    } else {
      clearLocalHistory()
      swr.mutate([], { revalidate: false })
    }
  }

  return {
    ...swr,
    push,
    remove,
    clear,
    getStats: () => {
      const data = swr.data || []
      const total = data.length

      if (total === 0) return { total: 0, favorite: "None", ripeRatio: 0 }

      // Calculate favorite fruit
      const counts: Record<string, number> = {}
      let maxCount = 0
      let favorite = "None"

      // Calculate ripe ratio
      let ripeCount = 0

      data.forEach(item => {
        // Favorite
        const fruit = item.fruit || "Unknown"
        counts[fruit] = (counts[fruit] || 0) + 1
        if (counts[fruit] > maxCount) {
          maxCount = counts[fruit]
          favorite = fruit
        }

        // Ripe ratio
        if (item.label === "Ripe") ripeCount++
      })

      return {
        total,
        favorite,
        ripeRatio: Math.round((ripeCount / total) * 100)
      }
    }
  }
}