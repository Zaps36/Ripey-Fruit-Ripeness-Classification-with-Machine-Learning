/**
 * API client for Flask backend predictions
 */

const FLASK_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:5000"

export interface PredictionResponse {
  fruit: string
  label: "Unripe" | "Ripe" | "Rotten"
  confidence: number
  error: string | null
}

export async function predictFruit(imageDataUrl: string): Promise<PredictionResponse> {
  try {
    const response = await fetch(`${FLASK_API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageDataUrl,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("[v0] predictFruit error:", error)
    return {
      fruit: "Unknown",
      label: "Ripe",
      confidence: 0,
      error: (error as Error).message,
    }
  }
}

export async function warmup(): Promise<void> {
  try {
    // Fire and forget health check to wake up server
    fetch(`${FLASK_API_URL}/health`, { method: 'GET' }).catch(() => { })
  } catch {
    // Ignore errors for warmup
  }
}
