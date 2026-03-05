import { useCallback } from 'react'
import { Schema } from 'effect/index'
import useSWR from 'swr'

import { LedgerBalancesSchema, type LedgerBalancesSchemaType } from '@schemas/generalLedger/ledgerAccount'
import { get } from '@utils/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const LEDGER_BALANCES_TAG_KEY = '#ledger-balances'

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

  return new SWRQueryResult(response)
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
