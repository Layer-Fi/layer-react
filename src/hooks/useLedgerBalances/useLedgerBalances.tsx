import { LedgerBalancesSchemaType, LedgerBalancesSchema } from '../../schemas/generalLedger/ledgerAccount'
import { get } from '../../api/layer/authenticated_http'
import useSWR, { type SWRResponse } from 'swr'
import { Schema } from 'effect/index'
import { useAuth } from '../useAuth'
import { useLayerContext } from '../../contexts/LayerContext'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'

class LedgerBalancesSWRResponse {
  private swrResponse: SWRResponse<LedgerBalancesSchemaType>
  private cacheKey: { readonly accessToken: string
    readonly apiUrl: string
    readonly businessId: string
    readonly startDate: Date | undefined
    readonly endDate: Date | undefined } | undefined

  constructor(swrResponse: SWRResponse<LedgerBalancesSchemaType>,
    key: { readonly accessToken: string
      readonly apiUrl: string
      readonly businessId: string
      readonly startDate: Date | undefined
      readonly endDate: Date | undefined } | undefined) {
    this.swrResponse = swrResponse
    this.cacheKey = key
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

  get fancyCacheKey() {
    if (!this.cacheKey) {
      return undefined
    }
    return `accessToken:${this.cacheKey.accessToken}-apiUrl:${this.cacheKey.apiUrl}-businessId:${this.cacheKey.businessId}-startDate:${this.cacheKey.startDate?.toISOString() ?? 'undefined'}-endDate:${this.cacheKey.endDate?.toISOString() ?? 'undefined'}`
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
    } as const
  }
}

export function useLedgerBalances(withDates?: boolean, startDate?: Date, endDate?: Date) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const queryKey = buildKey({
    ...data,
    businessId,
    startDate: withDates ? startDate : undefined,
    endDate: withDates ? endDate : undefined,
  })
  const response = useSWR(
    () => queryKey,
    ({ accessToken, apiUrl, businessId }) => getLedgerAccountBalances(
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

  return new LedgerBalancesSWRResponse(response, queryKey)
}
