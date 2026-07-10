import { ClassifierAgent, EntryType } from '@schemas/generalLedger/ledgerEntry'

import { PARENT_BY_STABLE_NAME } from '@fixtures/chartOfAccounts/constants'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { chartOfAccounts } from '@fixtures/generated/chartOfAccounts.gen'
import { zeroBalanceStableNames } from '@fixtures/ledgerEntries/constants'
import { schema } from '@fixtures/ledgerEntries/schema'
import { ledgerEntrySourceExamples } from '@fixtures/ledgerEntries/sources'
import { createGenerator } from '@fixtures/utils/createGenerator'
import { spreadDateAcrossYear } from '@fixtures/utils/spreadDateAcrossYear'

const ENTRY_NUMBER_START = 1001

const parentStableNames = new Set(Object.values(PARENT_BY_STABLE_NAME))

const postableAccounts = chartOfAccounts.filter((account) => {
  const stableName = account.stableName ?? ''

  return !parentStableNames.has(stableName) && !zeroBalanceStableNames.includes(stableName)
})

const generateLedgerEntries = createGenerator(schema, {
  uniqueBy: [entry => entry.id],
  numRuns: 40,
  seed: 2,
})

type FixtureEntry = ReturnType<typeof generateLedgerEntries>[number]

const entryAtNoonUtc = (index: number, total: number) => {
  const { year, month, day } = spreadDateAcrossYear(FIXTURE_YEAR, index, total)

  return new Date(Date.UTC(year, month - 1, day, 12))
}

const assignAccountsAndDates = (lineItems: FixtureEntry['lineItems'], startSlot: number, entryAt: Date) =>
  lineItems.map((lineItem, lineIndex) => ({
    ...lineItem,
    account: postableAccounts[(startSlot + lineIndex) % postableAccounts.length],
    entryAt,
    createdAt: entryAt,
  }))

export const generator: typeof generateLedgerEntries = (overrides) => {
  const entries = generateLedgerEntries(overrides)

  // Consecutive slots walk the postable accounts so every account gets at least one posting.
  let slot = 0

  return entries
    .map((entry, index) => {
      const entryAt = entryAtNoonUtc(index, entries.length)

      // The newest entries cover every source variant once; the rest stay Manual (from schema.ts).
      const { entryType = entry.entryType, source = entry.source } =
        ledgerEntrySourceExamples[entries.length - 1 - index] ?? {}

      const lineItems = assignAccountsAndDates(entry.lineItems, slot, entryAt)
      slot += lineItems.length

      return {
        ...entry,
        date: entryAt,
        entryAt,
        entryNumber: ENTRY_NUMBER_START + index,
        agent: entryType === EntryType.Manual ? ClassifierAgent.LayerManual : ClassifierAgent.Api,
        entryType,
        source,
        lineItems,
      }
    })
    .sort((a, b) => b.entryAt.getTime() - a.entryAt.getTime())
}
