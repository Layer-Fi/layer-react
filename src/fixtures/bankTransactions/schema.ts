import { Arbitrary, Schema } from 'effect'

import {
  BankTransactionSchema,
  CategorizationStatus,
} from '@schemas/bankTransactions/bankTransaction'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'

import {
  bankTransactionCustomerArbitrary,
  bankTransactionVendorArbitrary,
  sourceTransactionIdArbitrary,
} from '@fixtures/bankTransactions/arbitrary'
import { deriveBankTransaction } from '@fixtures/bankTransactions/derive'
import { bankTransactionRollsArbitrary } from '@fixtures/bankTransactions/roll'
import { makeBusiness } from '@fixtures/business/mocks'
import { dateArbitrary } from '@fixtures/utils/arbitrary/date'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'

const BUSINESS_ID = makeBusiness().id

const fields = BankTransactionSchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.bankTransaction)),
  businessId: withArbitrary(fields.businessId, () => fc => fc.constant(BUSINESS_ID)),
  sourceTransactionId: withArbitrary(fields.sourceTransactionId, () => sourceTransactionIdArbitrary),
  // Placeholder - the generator respreads dates across the fixture year.
  date: withArbitrary(fields.date, () => dateArbitrary),
  direction: withArbitrary(fields.direction, () => fc =>
    fc.constantFrom(...Object.values(BankTransactionDirection))),
  // Amounts are integer cents, matching the wire format.
  amount: withArbitrary(fields.amount, () => fc =>
    fc.integer({ min: 100, max: 1_000_000 })),
  counterpartyName: withArbitrary(fields.counterpartyName, () => fc => fc.constant(null)),
  description: withArbitrary(fields.description, () => fc => fc.constant(null)),
  // The correlated account/status/categorization/match structures are filled
  // in by the top-level arbitrary below; the field-level constants only exist
  // so the base struct stays derivable.
  sourceAccountId: withArbitrary(fields.sourceAccountId, () => fc => fc.constant(null)),
  accountName: withArbitrary(fields.accountName, () => fc => fc.constant(null)),
  accountMask: withArbitrary(fields.accountMask, () => fc => fc.constant(null)),
  accountInstitution: withArbitrary(fields.accountInstitution, () => fc => fc.constant(null)),
  categorizationStatus: withArbitrary(fields.categorizationStatus, () => fc =>
    fc.constant(CategorizationStatus.PENDING)),
  category: withArbitrary(fields.category, () => fc => fc.constant(null)),
  categorizationFlow: withArbitrary(fields.categorizationFlow, () => fc => fc.constant(null)),
  taxCode: withArbitrary(fields.taxCode, () => fc => fc.constant(null)),
  taxOptions: withArbitrary(fields.taxOptions, () => fc => fc.constant(null)),
  suggestedMatches: withArbitrary(fields.suggestedMatches, () => fc => fc.constant([])),
  match: withArbitrary(fields.match, () => fc => fc.constant(null)),
  transactionTags: withArbitrary(fields.transactionTags, () => fc => fc.constant([])),
  documentIds: withArbitrary(fields.documentIds, () => fc => fc.constant([])),
  memo: withArbitrary(fields.memo, () => fc => fc.constant(null)),
  referenceNumber: withArbitrary(fields.referenceNumber, () => fc => fc.constant(null)),
  metadata: withArbitrary(fields.metadata, () => fc => fc.constant(null)),
  customer: withArbitrary(fields.customer, () => bankTransactionCustomerArbitrary),
  vendor: withArbitrary(fields.vendor, () => bankTransactionVendorArbitrary),
  updateCategorizationRulesSuggestion: withArbitrary(
    fields.updateCategorizationRulesSuggestion,
    () => fc => fc.constant(null),
  ),
})

const baseArbitrary = Arbitrary.make(base)

export const BankTransactionArbitrarySchema = base.annotations({
  arbitrary: () => fc =>
    fc
      .tuple(baseArbitrary, bankTransactionRollsArbitrary(fc))
      .map(([transaction, rolls]): typeof base.Type => deriveBankTransaction(transaction, rolls)),
})

export const schema = BankTransactionArbitrarySchema
