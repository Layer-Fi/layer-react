import { CalendarDate } from '@internationalized/date'

import { schema } from '@fixtures/timeEntries/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'

const generateTimeEntries = createGenerator(schema, {
  uniqueBy: [entry => entry.externalId],
  numRuns: 60,
})

const YEAR = 2025
const DAYS_IN_YEAR = 365

const spreadDate = (index: number, total: number) => {
  const dayOffset = Math.floor((index * DAYS_IN_YEAR) / total)
  const date = new Date(Date.UTC(YEAR, 0, 1 + dayOffset))

  return new CalendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

export const generator: typeof generateTimeEntries = (overrides) => {
  const entries = generateTimeEntries(overrides)

  return entries
    .map((entry, index) => ({ ...entry, date: spreadDate(index, entries.length) }))
    .sort((a, b) => b.date.compare(a.date))
}
