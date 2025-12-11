export function formatScore(score: number) {
  return `${Math.round(score * 100)}%`
}

export function formatWhen(timestamp: number) {
  const diff = Date.now() - timestamp
  const sec = Math.max(1, Math.floor(diff / 1000))
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  return `${d}d ago`
}

export function labelFromScore(score: number) {
  if (score < 0.4) return "Unripe"
  if (score < 0.8) return "Ripe"
  return "Rotten"
}
