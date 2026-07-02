import { Schema } from 'effect/index'
import useSWR from 'swr'

import { LedgerBalancesSchema, type LedgerBalancesSchemaType } from '@schemas/generalLedger/ledgerAccount'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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

const buildKey = createBuildKey<{ businessId: string, startDate?: Date, endDate?: Date }>([LEDGER_BALANCES_TAG_KEY])

export function useLedgerBalances(withDates?: boolean, startDate?: Date, endDate?: Date) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()
  const response = useSWR(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      startDate: withDates ? startDate : undefined,
      endDate: withDates ? endDate : undefined,
    })),
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

export const useLedgerBalancesCacheActions = createResourceGlobalCacheActions<LedgerBalancesSchemaType>(LEDGER_BALANCES_TAG_KEY)
