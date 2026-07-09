import { type FastCheck } from 'effect'

import { LedgerEntryDirection } from '@schemas/generalLedger/ledgerAccount'

import { ROOT_STABLE_NAMES } from '@fixtures/chartOfAccounts/constants'
import { chartOfAccounts } from '@fixtures/generated/chartOfAccounts.gen'
import { customers as customerPool } from '@fixtures/generated/customers.gen'
import { vendors as vendorPool } from '@fixtures/generated/vendors.gen'
import { journalMemos } from '@fixtures/ledgerEntries/constants'
import { centsAmountArbitrary } from '@fixtures/utils/arbitrary/amount'
import { dateArbitrary } from '@fixtures/utils/arbitrary/date'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { nullableConstantFrom } from '@fixtures/utils/arbitrary/nullableConstantFrom'

const lineAmountArbitrary = centsAmountArbitrary({ minDollars: 10, maxDollars: 5000 })
const lineIdArbitrary = idArbitrary(FixtureIdPrefix.ledgerEntry)

// Entries post to real accounts, never to the top-level category headers.
const accountPool = chartOfAccounts.filter(account => !ROOT_STABLE_NAMES.includes(account.stableName ?? ''))

// `entryId` is filled in by schema.ts once the parent entry's own id is known.
const toLineItem = (
  id: string,
  account: (typeof accountPool)[number],
  amount: number,
  direction: LedgerEntryDirection,
  entryAt: Date,
) => ({
  id,
  entryId: '',
  account,
  amount,
  direction,
  customer: null,
  vendor: null,
  entryAt,
  createdAt: entryAt,
  entryReversalOf: null,
  entryReversedBy: null,
})

const lineCountShapeArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.constant({ debits: 1, credits: 1 }), weight: 6 },
    { arbitrary: fc.constant({ debits: 2, credits: 1 }), weight: 2 },
    { arbitrary: fc.constant({ debits: 1, credits: 2 }), weight: 2 },
    { arbitrary: fc.constant({ debits: 2, credits: 2 }), weight: 1 },
  )

export const ledgerEntryLineItemsArbitrary = (fc: typeof FastCheck) =>
  fc.tuple(
    fc.uniqueArray(fc.constantFrom(...accountPool), { minLength: 4, maxLength: 4 }),
    fc.tuple(lineAmountArbitrary(fc), lineAmountArbitrary(fc)),
    dateArbitrary(fc),
    fc.tuple(lineIdArbitrary(fc), lineIdArbitrary(fc), lineIdArbitrary(fc), lineIdArbitrary(fc)),
    lineCountShapeArbitrary(fc),
  ).map(([accounts, [amountA, amountB], entryAt, ids, { debits, credits }]) => {
    const debitAmounts = debits === 2 ? [amountA, amountB] : [credits === 2 ? amountA + amountB : amountA]
    const creditAmounts = credits === 2 ? [amountA, amountB] : [debits === 2 ? amountA + amountB : amountA]

    return [
      ...debitAmounts.map((amount, index) =>
        toLineItem(ids[index], accounts[index], amount, LedgerEntryDirection.Debit, entryAt)),
      ...creditAmounts.map((amount, index) =>
        toLineItem(ids[debits + index], accounts[debits + index], amount, LedgerEntryDirection.Credit, entryAt)),
    ]
  })

export const memoArbitrary = nullableConstantFrom(journalMemos, { nullWeight: 2, valueWeight: 5 })

export const entryCustomerArbitrary = nullableConstantFrom(customerPool, { nullWeight: 6, valueWeight: 1 })

export const entryVendorArbitrary = nullableConstantFrom(vendorPool, { nullWeight: 6, valueWeight: 1 })
