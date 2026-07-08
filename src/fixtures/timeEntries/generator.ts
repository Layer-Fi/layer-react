import { schema } from '@fixtures/timeEntries/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'
import { spreadDateAcrossYear } from '@fixtures/utils/spreadDateAcrossYear'

const generateTimeEntries = createGenerator(schema, {
  uniqueBy: [entry => entry.id, entry => entry.externalId],
  numRuns: 60,
})

const YEAR = 2025

export const generator: typeof generateTimeEntries = (overrides) => {
  const entries = generateTimeEntries(overrides)

  return entries
    .map((entry, index) => ({ ...entry, date: spreadDateAcrossYear(YEAR, index, entries.length) }))
    .sort((a, b) => b.date.compare(a.date))
}
