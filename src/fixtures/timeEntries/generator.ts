import { schema } from '@fixtures/timeEntries/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'
import { spreadDateAcrossYear } from '@fixtures/utils/spreadDateAcrossYear'

const generateTimeEntries = createGenerator(schema, {
  uniqueBy: [entry => entry.externalId],
  numRuns: 60,
})

const YEAR = 2025

const idForIndex = (index: number) =>
  `00000000-0000-4000-8000-${String(700000000000 + index).padStart(12, '0')}`

export const generator: typeof generateTimeEntries = (overrides) => {
  const entries = generateTimeEntries(overrides)

  return entries
    .map((entry, index) => ({
      ...entry,
      id: idForIndex(index),
      date: spreadDateAcrossYear(YEAR, index, entries.length),
    }))
    .sort((a, b) => b.date.compare(a.date))
}
