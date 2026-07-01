import { Schema } from 'effect'
import useSWRInfinite from 'swr/infinite'

import { PaginatedResponseSchema } from '@schemas/common/pagination'
import { LedgerAccountLineItemSchema } from '@schemas/generalLedger/ledgerEntry'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createInfiniteKeyLoader } from '@utils/swr/createBuildKey'
import { usePreserveInfiniteSize } from '@utils/swr/usePreserveInfiniteSize'
import { useSWRInfiniteResult } from '@utils/swr/useSWRInfiniteResult'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const LIST_LEDGER_ACCOUNT_LINES_TAG_KEY = '#list-ledger-account-lines'

type GetLedgerAccountLinesParams = {
  businessId: string
  accountId: string
  include_entries_before_activation?: boolean
  include_child_account_lines?: boolean
  start_date?: string
  end_date?: string
  sort_by?: 'entry_at' | 'entry_number' | 'created_at'
  sort_order?: 'ASC' | 'ASCENDING' | 'DESC' | 'DESCENDING' | 'DES'
  cursor?: string
  limit?: number
  show_total_count?: boolean
}

const ListLedgerAccountLinesResponseSchema = PaginatedResponseSchema(LedgerAccountLineItemSchema)

export type ListLedgerAccountLinesReturn = typeof ListLedgerAccountLinesResponseSchema.Type

export const listLedgerAccountLines = get<
  typeof ListLedgerAccountLinesResponseSchema.Encoded,
  GetLedgerAccountLinesParams
>(({
  businessId,
  accountId,
  include_entries_before_activation,
  include_child_account_lines,
  start_date,
  end_date,
  sort_by,
  sort_order,
  cursor,
  limit,
  show_total_count,
}) => {
  const parameters = toDefinedSearchParameters({
    include_entries_before_activation,
    include_child_account_lines,
    start_date,
    end_date,
    sort_by,
    sort_order,
    cursor,
    limit,
    show_total_count,
  })

  return `/v1/businesses/${businessId}/ledger/accounts/${accountId}/lines?${parameters}`
})

const keyLoader = createInfiniteKeyLoader<
  UseListLedgerAccountLinesOptions & { businessId: string },
  ListLedgerAccountLinesReturn
>([LIST_LEDGER_ACCOUNT_LINES_TAG_KEY])

export type UseListLedgerAccountLinesOptions = {
  accountId: string
  include_entries_before_activation?: boolean
  include_child_account_lines?: boolean
  start_date?: string
  end_date?: string
  sort_by?: 'entry_at' | 'entry_number' | 'created_at'
  sort_order?: 'ASC' | 'ASCENDING' | 'DESC' | 'DESCENDING' | 'DES'
  limit?: number
  show_total_count?: boolean
}

export function useListLedgerAccountLines({
  accountId,
  include_entries_before_activation,
  include_child_account_lines,
  start_date,
  end_date,
  sort_by,
  sort_order,
  limit,
  show_total_count,
}: UseListLedgerAccountLinesOptions) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const swrResponse = useSWRInfinite(
    (_index, previousPageData: ListLedgerAccountLinesReturn | null) => withLocale(keyLoader(
      previousPageData,
      {
        ...auth,
        businessId,
        accountId,
        include_entries_before_activation,
        include_child_account_lines,
        start_date,
        end_date,
        sort_by,
        sort_order,
        limit,
        show_total_count,
        isEnabled: Boolean(accountId),
      },
    )),
    ({
      accessToken,
      apiUrl,
      businessId,
      accountId,
      cursor,
      include_entries_before_activation,
      include_child_account_lines,
      start_date,
      end_date,
      sort_by,
      sort_order,
      limit,
      show_total_count,
    }) => listLedgerAccountLines(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          accountId,
          cursor,
          include_entries_before_activation,
          include_child_account_lines,
          start_date,
          end_date,
          sort_by,
          sort_order,
          limit,
          show_total_count,
        },
      },
    )().then(Schema.decodeUnknownPromise(ListLedgerAccountLinesResponseSchema)),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )

  usePreserveInfiniteSize(swrResponse)

  return useSWRInfiniteResult(swrResponse)
}
