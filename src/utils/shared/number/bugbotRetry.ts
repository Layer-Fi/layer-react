// Temporary file for testing Layer Bugbot. This PR will be closed, not merged.

export function averageCents(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
}
