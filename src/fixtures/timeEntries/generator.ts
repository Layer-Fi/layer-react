import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { schema } from '@fixtures/timeEntries/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'
import { spreadDateAcrossYear } from '@fixtures/utils/spreadDateAcrossYear'

const generateTimeEntries = createGenerator(schema, {
  uniqueBy: [entry => entry.id],
  numRuns: 60,
})

export const generator: typeof generateTimeEntries = (overrides) => {
  const entries = generateTimeEntries(overrides)

  return entries
    .map((entry, index) => ({ ...entry, date: spreadDateAcrossYear(FIXTURE_YEAR, index, entries.length) }))
    .sort((a, b) => b.date.compare(a.date))
}
