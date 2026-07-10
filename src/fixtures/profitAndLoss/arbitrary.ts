import { type FastCheck } from 'effect'

import { centsAmountArbitrary } from '@fixtures/utils/arbitrary/amount'

export const incomeArbitrary = centsAmountArbitrary({ minDollars: 14000, maxDollars: 42000 })

export const costOfGoodsSoldArbitrary = centsAmountArbitrary({ minDollars: 4000, maxDollars: 16000 })

/** Small positive net keeps every generated month slightly profitable. */
export const netProfitArbitrary = centsAmountArbitrary({ minDollars: 300, maxDollars: 2800 })

export const taxesArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.constant(0), weight: 1 },
    { arbitrary: centsAmountArbitrary({ minDollars: 100, maxDollars: 1600 })(fc), weight: 3 },
  )

export const uncategorizedAmountArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.constant(0), weight: 1 },
    { arbitrary: centsAmountArbitrary({ minDollars: 1800, maxDollars: 7500 })(fc), weight: 4 },
  )

export const categorizedTransactionsArbitrary = (fc: typeof FastCheck) =>
  fc.integer({ min: 40, max: 120 })

export const uncategorizedTransactionsArbitrary = (fc: typeof FastCheck) =>
  fc.integer({ min: 3, max: 9 })
