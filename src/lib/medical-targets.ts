/**
 * Medical target calculations for milk intake and sleep duration.
 * Based on OMS recommendations and pediatric reference tables.
 */

/**
 * Calculate daily milk target range based on baby weight.
 * Formula: 120–180 mL/kg/day (standard pediatric range).
 * @param weightHg Weight in hectograms (e.g., 42 = 4.2 kg)
 */
export function getMilkTarget(weightHg: number): { min: number; max: number } {
  const weightKg = weightHg / 10
  return {
    min: Math.round(weightKg * 120),
    max: Math.round(weightKg * 180),
  }
}

/**
 * Calculate daily sleep target range based on baby age.
 * Reference: National Sleep Foundation guidelines.
 * @param dob Date of birth as ISO string
 */
export function getSleepTarget(dob: string): { min: number; max: number } {
  const birthDate = new Date(dob)
  const now = new Date()
  const ageMonths =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth())

  // Minutes per day
  if (ageMonths < 1) return { min: 14 * 60, max: 17 * 60 }
  if (ageMonths < 4) return { min: 14 * 60, max: 17 * 60 }
  if (ageMonths < 12) return { min: 12 * 60, max: 15 * 60 }
  return { min: 11 * 60, max: 14 * 60 } // 12–24 months
}

/**
 * Calculate bottle slider range based on baby weight.
 * min = 30 mL (fixed), max = weightKg * 50 clamped [150, 350].
 * @param weightHg Weight in hectograms
 */
export function getMilkRange(weightHg: number): { min: number; max: number; step: number } {
  const weightKg = weightHg / 10
  const max = Math.min(350, Math.max(150, Math.round(weightKg * 50)))
  return { min: 30, max, step: 10 }
}
