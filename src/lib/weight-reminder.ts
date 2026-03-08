/**
 * Calculate the next weight reminder date based on baby's date of birth.
 * Reminder day = birth day + 10, clamped to last day of month.
 * Returns the next future date (current month or next month).
 */
export function getNextReminderDate(dob: string): Date {
  const birth = new Date(dob)
  const reminderDay = birth.getDate() + 10
  const now = new Date()

  // Try current month
  const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const day = Math.min(reminderDay, lastDayThisMonth)
  const candidate = new Date(now.getFullYear(), now.getMonth(), day)

  if (candidate > now) return candidate

  // Next month
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const lastDayNextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()
  return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(reminderDay, lastDayNextMonth))
}

/**
 * Check if the weight reminder should be shown today.
 * Returns true if reminder is enabled and the reminder date is today or in the past
 * (within current month, meaning user hasn't been reminded yet).
 */
export function shouldShowWeightReminder(dob: string, weightReminder: boolean): boolean {
  if (!weightReminder) return false

  const birth = new Date(dob)
  const reminderDay = birth.getDate() + 10
  const now = new Date()

  const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const day = Math.min(reminderDay, lastDayThisMonth)
  const reminderDate = new Date(now.getFullYear(), now.getMonth(), day)

  // Show if reminder date is today or has passed this month
  return now >= reminderDate
}
