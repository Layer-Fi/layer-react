import { Schema } from 'effect'

import { type BankTransactionCounterparty, BankTransactionCounterpartySchema } from '@schemas/bankTransactions/base'

import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter, matchesQuery } from '@msw/utils/createListFilter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { counterparties as defaultCounterparties } from '@fixtures/counterparties/mocks'

const encodeCounterparty = Schema.encodeSync(BankTransactionCounterpartySchema)

const filterByQuery = createListFilter<BankTransactionCounterparty>({
  q: matchesQuery(counterparty => [counterparty.name, counterparty.website]),
})

const filterByExternalIds = (
  counterparties: readonly BankTransactionCounterparty[],
  request: Request,
) => {
  const externalIds = new URL(request.url).searchParams.getAll('external_ids')
  if (externalIds.length === 0) return [...counterparties]

  return counterparties.filter(({ externalId }) => externalId != null && externalIds.includes(externalId))
}

const sortByName = (counterparties: readonly BankTransactionCounterparty[], request: Request) => {
  const descending = new URL(request.url).searchParams.get('sort_order') === 'DESC'

  return [...counterparties].sort(
    (a, b) => (a.name ?? '').localeCompare(b.name ?? '') * (descending ? -1 : 1),
  )
}

const toResponse = (counterparties: readonly BankTransactionCounterparty[], request: Request) =>
  paginatedApiData(counterparties.map(counterparty => encodeCounterparty(counterparty)), request)

export const get = createMockEndpoint<readonly BankTransactionCounterparty[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/counterparties',
  resolve: ({ override: counterparties = defaultCounterparties, request }) =>
    toResponse(sortByName(filterByExternalIds(filterByQuery(counterparties, request), request), request), request),
})
