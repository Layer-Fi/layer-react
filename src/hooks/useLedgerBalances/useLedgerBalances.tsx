import { LedgerBalancesSchemaType, LedgerBalancesSchema } from '../../schemas/generalLedger/ledgerAccount'
import { get } from '../../api/layer/authenticated_http'
import useSWR, { type SWRResponse } from 'swr'
import { Schema } from 'effect/index'
import { useAuth } from '../useAuth'
import { useLayerContext } from '../../contexts/LayerContext'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import { useGlobalCacheActions } from '../../utils/swr/useGlobalCacheActions'
import { useCallback } from 'react'

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

export function useLedgerBalancesInvalidator() {
  const { invalidate } = useGlobalCacheActions()

  const invalidateLedgerBalances = useCallback(
    () => invalidate(tags => tags.includes(LEDGER_BALANCES_TAG_KEY)),
    [invalidate],
  )

  return {
    invalidateLedgerBalances,
  }
}
