export interface DurationResult {
  days: number
  hours: number
  totalHours: number
}

/**
 * Calculates the duration between two dates
 * @param fromDate Start date (ISO string or Date)
 * @param toDate End date (ISO string or Date)
 * @returns Object with days, hours, and totalHours
 */
export function calculateDuration(fromDate: string | Date, toDate: string | Date): DurationResult {
  const from = typeof fromDate === 'string' ? new Date(fromDate) : fromDate
  const to = typeof toDate === 'string' ? new Date(toDate) : toDate

  const diffMs = to.getTime() - from.getTime()
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60))

  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24

  return {
    days,
    hours,
    totalHours,
  }
}

/**
 * Formats a duration result for display
 * @param duration Duration result from calculateDuration
 * @param t Translation function for i18n
 * @returns Formatted string like "3j 5h" or "12h"
 */
export function formatDuration(
  duration: DurationResult,
  formatDay: (days: number) => string,
  formatHour: (hours: number) => string
): string {
  if (duration.days > 0) {
    return `${formatDay(duration.days)} ${formatHour(duration.hours)}`
  }
  return formatHour(duration.totalHours)
}
