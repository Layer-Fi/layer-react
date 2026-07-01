import { Schema } from 'effect'

import {
  BankTransactionSchema,
  CategorizationStatus,
} from '@schemas/bankTransactions/bankTransaction'
import { BankTransactionDirection } from '@schemas/bankTransactions/base'

import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { type BankTransactionFixture } from '@fixtures/bankTransactions/schema'
import { bankTransactions as defaultBankTransactions } from '@fixtures/generated/bankTransactions.gen'

const encodeBankTransaction = Schema.encodeSync(BankTransactionSchema)

// Generated fixtures are JSON: dates (including those nested inside matches)
// are ISO strings. Revive them to Dates so the schema can encode the
// transaction back to the wire (snake_case) format.
const reviveMatch = <T extends {
  bankTransaction?: { date: string }
  details: { date: string }
}>(match: T) => ({
  ...match,
  ...match.bankTransaction
    ? { bankTransaction: { ...match.bankTransaction, date: new Date(match.bankTransaction.date) } }
    : {},
  details: { ...match.details, date: new Date(match.details.date) },
})

const encode = (transaction: BankTransactionFixture) =>
  encodeBankTransaction({
    ...transaction,
    date: new Date(transaction.date),
    match: transaction.match === null ? null : reviveMatch(transaction.match),
    suggestedMatches: transaction.suggestedMatches.map(reviveMatch),
  } as unknown as typeof BankTransactionSchema.Type)

// Statuses the real endpoint treats as "categorized" for the `?categorized=` filter.
const CATEGORIZED_STATUSES: readonly string[] = [
  CategorizationStatus.CATEGORIZED,
  CategorizationStatus.MATCHED,
  CategorizationStatus.SPLIT,
]

type PageMeta = { cursor: string | null, hasMore: boolean, totalCount: number }

// Unlike most endpoints, the paginated response is not wrapped in the
// top-level `data` envelope: `data` and `meta.pagination` are the envelope.
const toResponse = (
  transactions: readonly BankTransactionFixture[],
  { cursor, hasMore, totalCount }: PageMeta,
) => ({
  data: transactions.map(encode),
  meta: {
    pagination: {
      cursor,
      has_more: hasMore,
      total_count: totalCount,
    },
  },
})

export const get = createMockEndpoint<
  readonly BankTransactionFixture[],
  ReturnType<typeof toResponse>
>({
  method: 'get',
  path: '*/v1/businesses/:businessId/bank-transactions',
  resolve: ({ override: transactions = defaultBankTransactions, request }) => {
    const searchParams = new URL(request.url).searchParams

    // Mirror the real endpoint's filters, then paginate over what remains.
    let filtered = transactions

    const direction = searchParams.get('direction')
    if (direction !== null) {
      // INFLOW corresponds to a CREDIT, OUTFLOW to a DEBIT.
      const wanted: string = direction === 'INFLOW'
        ? BankTransactionDirection.Credit
        : BankTransactionDirection.Debit
      filtered = filtered.filter(transaction => transaction.direction === wanted)
    }

    const categorized = searchParams.get('categorized')
    if (categorized !== null) {
      const isCategorized = categorized === 'true'
      filtered = filtered.filter(
        transaction => CATEGORIZED_STATUSES.includes(transaction.categorizationStatus) === isCategorized,
      )
    }

    // The cursor is an offset into the filtered set; limit defaults to everything.
    const offset = Number(searchParams.get('cursor') ?? 0)
    const limit = Number(searchParams.get('limit') ?? filtered.length)
    const page = filtered.slice(offset, offset + limit)
    const nextOffset = offset + limit
    const hasMore = nextOffset < filtered.length

    return toResponse(page, {
      cursor: hasMore ? String(nextOffset) : null,
      hasMore,
      totalCount: filtered.length,
    })
  },
})
