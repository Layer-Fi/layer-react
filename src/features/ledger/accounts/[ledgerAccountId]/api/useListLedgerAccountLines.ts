import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash-es'
import useSWRInfinite from 'swr/infinite'

import { type LedgerAccountLineItem, type LedgerAccountLineItems } from '@internal-types/ledger_accounts'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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

export type ListLedgerAccountLinesReturn = {
  data: LedgerAccountLineItems
  meta?: {
    pagination: {
      cursor?: string
      has_more: boolean
      total_count?: number
    }
  }
}

export const listLedgerAccountLines = get<
  ListLedgerAccountLinesReturn,
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

function keyLoader(
  previousPageData: ListLedgerAccountLinesReturn | null,
  {
    access_token: accessToken,
    apiUrl,
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
  }: {
    access_token?: string
    apiUrl?: string
    businessId: string
    accountId: string
    include_entries_before_activation?: boolean
    include_child_account_lines?: boolean
    start_date?: string
    end_date?: string
    sort_by?: 'entry_at' | 'entry_number' | 'created_at'
    sort_order?: 'ASC' | 'ASCENDING' | 'DESC' | 'DESCENDING' | 'DES'
    limit?: number
    show_total_count?: boolean
  },
) {
  if (accessToken && apiUrl && accountId) {
    return {
      accessToken,
      apiUrl,
      businessId,
      accountId,
      cursor: previousPageData?.meta?.pagination.cursor,
      include_entries_before_activation,
      include_child_account_lines,
      start_date,
      end_date,
      sort_by,
      sort_order,
      limit,
      show_total_count,
      tags: [LIST_LEDGER_ACCOUNT_LINES_TAG_KEY],
    } as const
  }
}

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
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  return useSWRInfinite(
    (_index, previousPageData: ListLedgerAccountLinesReturn | null) => keyLoader(
      previousPageData,
      {
        ...auth,
        apiUrl,
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
      },
    ),
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
    )(),
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      initialSize: 1,
    },
  )
}

const INVALIDATION_DEBOUNCE_OPTIONS = {
  wait: 1000,
  maxWait: 3000,
}

export function useLedgerAccountLinesInvalidator() {
  const { invalidate } = useGlobalCacheActions()

  const invalidateLedgerAccountLines = useCallback(
    () => invalidate(tags => tags.includes(LIST_LEDGER_ACCOUNT_LINES_TAG_KEY)),
    [invalidate],
  )

  const debouncedInvalidateLedgerAccountLines = useMemo(
    () => debounce(
      invalidateLedgerAccountLines,
      INVALIDATION_DEBOUNCE_OPTIONS.wait,
      {
        maxWait: INVALIDATION_DEBOUNCE_OPTIONS.maxWait,
        trailing: true,
      },
    ),
    [invalidateLedgerAccountLines],
  )

  return {
    invalidateLedgerAccountLines,
    debouncedInvalidateLedgerAccountLines,
  }
}

export function useLedgerAccountLinesOptimisticUpdater() {
  const { optimisticUpdate } = useGlobalCacheActions()

  const optimisticallyUpdateLedgerAccountLines = useCallback(
    (
      transformLineItem: (lineItem: LedgerAccountLineItem) => LedgerAccountLineItem,
    ) =>
      optimisticUpdate<ListLedgerAccountLinesReturn>(
        tags => tags.includes(LIST_LEDGER_ACCOUNT_LINES_TAG_KEY),
        (currentData) => {
          return {
            ...currentData,
            data: {
              ...currentData.data,
              lines: currentData.data?.map(line => transformLineItem(line)),
            },
          }
        },
      ),
    [optimisticUpdate],
  )

  return { optimisticallyUpdateLedgerAccountLines }
}
