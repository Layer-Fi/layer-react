import { eachMonthOfInterval, isWithinInterval } from 'date-fns'

export type MockReportEntry = {
  date: Date
  amountCents: number
  entryType: string
  description: string
}

// FNV-1a, so every amount is a pure function of its stable key.
export const hashString = (value: string): number => {
  let hash = 0x811c9dc5

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }

  return hash
}

const unitFromHash = (key: string) => hashString(key) / 2 ** 32

export type EntryStreamOptions = {
  /** Scales the base amount, e.g. to make revenue accounts larger than expense accounts. */
  magnitude?: number
  /** Cash basis shrinks every entry by a deterministic per-key factor so drill-downs still reconcile. */
  cashBasis?: boolean
}

export const monthlyAmountCents = (
  stableKey: string,
  year: number,
  monthIndex: number,
  magnitude: number = 1,
): number => {
  const base = 40_000 + Math.floor(unitFromHash(stableKey) * 220_000)
  const phase = hashString(`${stableKey}:phase`) % 12
  const seasonal = 1 + 0.25 * Math.sin((2 * Math.PI * (monthIndex + phase)) / 12)
  const yearShift = 1 + ((hashString(`${stableKey}:${year}`) % 21) - 10) / 100

  return Math.round(base * magnitude * seasonal * yearShift)
}

const cashBasisScale = (stableKey: string) => 0.8 + (hashString(`${stableKey}:cash`) % 16) / 100

const ENTRY_DAYS = [5, 14, 25]
const LEADING_ENTRY_WEIGHTS = [0.5, 0.3]

const ENTRY_TYPES = ['Invoice', 'Expense', 'Payment', 'Journal Entry']

const ENTRY_DESCRIPTIONS = [
  'Card payment',
  'ACH transfer',
  'Monthly service',
  'Recurring charge',
  'Vendor payment',
  'Customer payment',
]

const pickFrom = (values: readonly string[], key: string) => values[hashString(key) % values.length]

export const monthEntries = (
  stableKey: string,
  year: number,
  monthIndex: number,
  { magnitude = 1, cashBasis = false }: EntryStreamOptions = {},
): MockReportEntry[] => {
  const monthTotal = monthlyAmountCents(stableKey, year, monthIndex, magnitude)
  const scale = cashBasis ? cashBasisScale(stableKey) : 1

  let remaining = monthTotal

  return ENTRY_DAYS.map((day, index) => {
    const isLast = index === ENTRY_DAYS.length - 1
    const rawAmount = isLast ? remaining : Math.round(monthTotal * LEADING_ENTRY_WEIGHTS[index])
    remaining -= rawAmount

    const entryKey = `${stableKey}:${year}-${monthIndex}-${index}`

    return {
      date: new Date(year, monthIndex, day),
      amountCents: Math.round(rawAmount * scale),
      entryType: pickFrom(ENTRY_TYPES, `${entryKey}:type`),
      description: pickFrom(ENTRY_DESCRIPTIONS, `${entryKey}:description`),
    }
  })
}

/*
 * The single source of truth for report amounts: summary cells and line item
 * detail rows must both sum this same stream so drill-downs reconcile exactly.
 */
export const entriesInRange = (
  stableKey: string,
  startDate: Date,
  endDate: Date,
  options: EntryStreamOptions = {},
): MockReportEntry[] => {
  if (startDate > endDate) return []

  return eachMonthOfInterval({ start: startDate, end: endDate })
    .flatMap(month => monthEntries(stableKey, month.getFullYear(), month.getMonth(), options))
    .filter(entry => isWithinInterval(entry.date, { start: startDate, end: endDate }))
}

export const sumAmountCentsInRange = (
  stableKey: string,
  startDate: Date,
  endDate: Date,
  options: EntryStreamOptions = {},
): number => entriesInRange(stableKey, startDate, endDate, options)
  .reduce((total, entry) => total + entry.amountCents, 0)
