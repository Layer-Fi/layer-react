import { type PaginationParams, SortOrder, type SortParams } from '@internal-types/utility/pagination'
import { BankTransactionCounterpartySchema } from '@schemas/bankTransactions/base'
import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createInfiniteQueryHook } from '@hooks/utils/swr/createInfiniteQueryHook'

export const LIST_COUNTERPARTIES_TAG_KEY = '#list-counterparties'

export type ListCounterpartiesFilterParams = {
  externalIds?: ReadonlyArray<string>
  q?: string
}

enum SortBy {
  Name = 'name',
}

type ListCounterpartiesParams = {
  businessId: string
  cursor?: string
} & ListCounterpartiesFilterParams & Omit<PaginationParams, 'cursor'> & SortParams<SortBy>

const ListCounterpartiesReturnSchema = PaginatedResponseSchema(BankTransactionCounterpartySchema)

export const listCounterparties = getWithQuery<
  typeof ListCounterpartiesReturnSchema.Encoded,
  ListCounterpartiesParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/counterparties`,
)

export const useListCounterparties = createInfiniteQueryHook({
  tags: [LIST_COUNTERPARTIES_TAG_KEY],
  request: listCounterparties,
  schema: ListCounterpartiesReturnSchema,
  keyDefaults: {
    sortBy: SortBy.Name,
    sortOrder: SortOrder.ASC,
    showTotalCount: true,
  },
})
