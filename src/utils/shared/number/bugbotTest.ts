// Temporary file for testing Layer Bugbot. This PR will be closed, not merged.

import type { PercentFormatFn } from '@utils/shared/i18n/number/formatters'

export function sumCents(values: number[]): number {
  let total = 0
  for (const value of values) {
    total += value
  }
  return total
}

export function formatShareOfWhole(part: number, whole: number, formatPercent: PercentFormatFn): string {
  return whole === 0 ? '' : formatPercent(part / whole, { maximumFractionDigits: 0 })
}
