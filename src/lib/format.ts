/**
 * Format a duration in milliseconds to a human-readable string.
 * >= 1h: "Xh00" or "XhMM"
 * < 1h: "Xmin"
 * < 1min: "0min"
 */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000)
  if (totalMinutes < 1) return '0min'
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours >= 1) {
    return `${hours}h${String(minutes).padStart(2, '0')}`
  }
  return `${minutes}min`
}

/**
 * Format a Date to "14h30" style (no leading zero for hours).
 */
export function formatTime(date: Date): string {
  const h = date.getHours()
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}h${m}`
}
