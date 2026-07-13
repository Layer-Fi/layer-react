import { Arbitrary, Schema } from 'effect'

import { ClassifierAgent, EntryType, LedgerEntrySchema } from '@schemas/generalLedger/ledgerEntry'

import { makeBusiness } from '@fixtures/business/mocks'
import {
  entryCustomerArbitrary,
  entryVendorArbitrary,
  ledgerEntryLineItemsArbitrary,
  memoArbitrary,
} from '@fixtures/ledgerEntries/arbitrary'
import { makeManualEntrySource } from '@fixtures/ledgerEntries/sources'
import { dateArbitrary } from '@fixtures/utils/arbitrary/date'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'

const BUSINESS_ID = makeBusiness().id
const LEDGER_ID = '00000000-0000-4000-8000-0000000000ff'

const fields = LedgerEntrySchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.ledgerEntry)),
  businessId: withArbitrary(fields.businessId, () => fc => fc.constant(BUSINESS_ID)),
  ledgerId: withArbitrary(fields.ledgerId, () => fc => fc.constant(LEDGER_ID)),
  entryNumber: withArbitrary(fields.entryNumber, () => fc => fc.constant(null)),
  agent: withArbitrary(fields.agent, () => fc => fc.constant(ClassifierAgent.Api)),
  entryType: withArbitrary(fields.entryType, () => fc => fc.constant(EntryType.Manual)),
  customer: withArbitrary(fields.customer, () => entryCustomerArbitrary),
  vendor: withArbitrary(fields.vendor, () => entryVendorArbitrary),
  date: withArbitrary(fields.date, () => dateArbitrary),
  entryAt: withArbitrary(fields.entryAt, () => dateArbitrary),
  reversalOfId: withArbitrary(fields.reversalOfId, () => fc => fc.constant(null)),
  reversalId: withArbitrary(fields.reversalId, () => fc => fc.constant(null)),
  lineItems: withArbitrary(fields.lineItems, () => ledgerEntryLineItemsArbitrary),
  source: withArbitrary(fields.source, () => fc => fc.constant(null)),
  transactionTags: withArbitrary(fields.transactionTags, () => fc => fc.constant([])),
  memo: withArbitrary(fields.memo, () => memoArbitrary),
  metadata: withArbitrary(fields.metadata, () => fc => fc.constant(null)),
  referenceNumber: withArbitrary(fields.referenceNumber, () => fc => fc.constant(null)),
})

const baseArbitrary = Arbitrary.make(base)

export const LedgerEntryArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((entry): typeof base.Type => {
      const [date, entryAt] = [entry.date, entry.entryAt].sort((a, b) => a.getTime() - b.getTime())
      const lineItems = entry.lineItems.map(lineItem => ({
        ...lineItem,
        entryId: entry.id,
        entryAt,
        createdAt: entryAt,
      }))

      return {
        ...entry,
        date,
        entryAt,
        lineItems,
        source: makeManualEntrySource({ id: entry.id, memo: entry.memo ?? null }),
      }
    }),
})

export const schema = LedgerEntryArbitrarySchema
