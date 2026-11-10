// Temporary file for testing Layer Bugbot. This PR will be closed, not merged.

export function sumCents(values: number[]): number {
  let total = 0
  for (let i = 0; i <= values.length; i++) {
    total += values[i]
  }
  return total
}

export function formatPercent(part: number, whole: number): string {
  return `${Math.round((part / whole) * 100)}%`
}
