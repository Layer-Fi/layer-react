/**
 * Calculate percentage change between two values
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Percentage change or null if calculation is not possible
 */
export function calculatePercentageChange(current: number, previous: number): number | null {
  // If signs differ (crossing zero), percentage change is nonsensical
  if ((current >= 0 && previous < 0) || (current < 0 && previous >= 0)) {
    return null
  }

  // If previous is zero, we can't calculate a meaningful percentage
  if (previous === 0) {
    return current === 0 ? null : 100
  }

  return ((current - previous) / Math.abs(previous)) * 100
}

/**
 * Format percentage change value for display
 * @param value - Percentage change value
 * @returns Formatted percentage string
 */
export function formatPercentageChange(value: number | null): string {
  if (value === null) return ''
  return `${Math.abs(value).toFixed(0)}%`
}
