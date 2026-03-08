export function parseDeviceName(userAgent: string | null): string {
  if (!userAgent) return 'Appareil inconnu'
  if (userAgent.includes('iPhone')) return 'iPhone Safari'
  if (userAgent.includes('Android')) return 'Chrome Android'
  if (userAgent.includes('Mac')) return 'Mac Safari'
  if (userAgent.includes('Windows')) return 'Windows Chrome'
  return 'Navigateur'
}
