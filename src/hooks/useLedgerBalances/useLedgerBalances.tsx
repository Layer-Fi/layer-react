import { useCallback } from 'react'
import { Schema } from 'effect/index'
import useSWR, { type SWRResponse } from 'swr'

import { LedgerBalancesSchema, type LedgerBalancesSchemaType } from '@schemas/generalLedger/ledgerAccount'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const LEDGER_BALANCES_TAG_KEY = '#ledger-balances'

class LedgerBalancesSWRResponse {
  private swrResponse: SWRResponse<LedgerBalancesSchemaType>

  constructor(
    swrResponse: SWRResponse<LedgerBalancesSchemaType>,
  ) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }

  get mutate() {
    return this.swrResponse.mutate
  }
}

type GetLedgerAccountBalancesParams = {
  businessId: string
  startDate?: Date
  endDate?: Date
}

const getLedgerAccountBalances = get<{ data: LedgerBalancesSchemaType }, GetLedgerAccountBalancesParams>(
  ({ businessId, startDate, endDate }) => {
    const parameters = toDefinedSearchParameters({ startDate, endDate })

    return `/v1/businesses/${businessId}/ledger/balances?${parameters}`
  },
)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  startDate,
  endDate,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  startDate?: Date
  endDate?: Date
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      startDate,
      endDate,
      tags: [LEDGER_BALANCES_TAG_KEY],
    } as const
  }
}

export function useLedgerBalances(withDates?: boolean, startDate?: Date, endDate?: Date) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const response = useSWR(
    () => buildKey({
      ...data,
      businessId,
      startDate: withDates ? startDate : undefined,
      endDate: withDates ? endDate : undefined,
    }),
    ({ accessToken, apiUrl, businessId, startDate, endDate }) => getLedgerAccountBalances(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          startDate,
          endDate,
        },
      },
    )().then(({ data }) => Schema.decodeUnknownPromise(LedgerBalancesSchema)(data)),
  )

  return new LedgerBalancesSWRResponse(response)
}

export function useLedgerBalancesCacheActions() {
  const { invalidate, forceReload } = useGlobalCacheActions()

  const invalidateLedgerBalances = useCallback(
    () => invalidate(({ tags }) => tags.includes(LEDGER_BALANCES_TAG_KEY)),
    [invalidate],
  )

  const forceReloadLedgerBalances = useCallback(
    () => forceReload(({ tags }) => tags.includes(LEDGER_BALANCES_TAG_KEY)),
    [forceReload],
  )

  return {
    invalidateLedgerBalances, forceReloadLedgerBalances,
  }
}
