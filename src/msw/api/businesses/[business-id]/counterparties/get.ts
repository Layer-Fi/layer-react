import { Schema } from 'effect'

import { type BankTransactionCounterparty, BankTransactionCounterpartySchema } from '@schemas/bankTransactions/base'

import { counterpartyStore } from '@msw/api/businesses/[business-id]/counterparties/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter, matchesQuery } from '@msw/utils/createListFilter'
import { createListSorter } from '@msw/utils/createListSorter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeCounterparty = Schema.encodeSync(BankTransactionCounterpartySchema)

const filterCounterparties = createListFilter<BankTransactionCounterparty>({
  q: matchesQuery(counterparty => [counterparty.name, counterparty.website]),
})

const sortCounterparties = createListSorter<BankTransactionCounterparty>({
  name: counterparty => counterparty.name ?? '',
}, 'name')

const toResponse = (counterparties: readonly BankTransactionCounterparty[], request: Request) =>
  paginatedApiData(counterparties.map(counterparty => encodeCounterparty(counterparty)), request)

export const get = createMockEndpoint<readonly BankTransactionCounterparty[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/counterparties',
  resolve: ({ override: counterparties = counterpartyStore.all(), request }) =>
    toResponse(sortCounterparties(filterCounterparties(counterparties, request), request), request),
})
