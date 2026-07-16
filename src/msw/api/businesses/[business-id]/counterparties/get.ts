import { Schema } from 'effect'

import { type BankTransactionCounterparty, BankTransactionCounterpartySchema } from '@schemas/bankTransactions/base'

import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter, matchesQuery } from '@msw/utils/createListFilter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { counterparties as defaultCounterparties } from '@fixtures/generated/counterparties.gen'

const encodeCounterparty = Schema.encodeSync(BankTransactionCounterpartySchema)

const filterCounterparties = createListFilter<BankTransactionCounterparty>({
  q: matchesQuery(counterparty => [counterparty.name, counterparty.website]),
})

const sortByName = (counterparties: readonly BankTransactionCounterparty[], request: Request) => {
  const ascending = ['ASC', 'ASCENDING'].includes(
    new URL(request.url).searchParams.get('sort_order') ?? 'ASC',
  )

  return [...counterparties].sort(
    (a, b) => (a.name ?? '').localeCompare(b.name ?? '') * (ascending ? 1 : -1),
  )
}

const toResponse = (counterparties: readonly BankTransactionCounterparty[], request: Request) =>
  paginatedApiData(counterparties.map(counterparty => encodeCounterparty(counterparty)), request)

export const get = createMockEndpoint<readonly BankTransactionCounterparty[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/counterparties',
  resolve: ({ override: counterparties = defaultCounterparties, request }) =>
    toResponse(sortByName(filterCounterparties(counterparties, request), request), request),
})
