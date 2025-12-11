export type RipenessLabel = "Unripe" | "Ripe" | "Rotten"

export interface HistoryEntry {
  id: string
  fruit: string
  score: number // 0..1
  label: RipenessLabel
  createdAt: number // epoch ms
  note?: string
  previewDataUrl?: string
}
