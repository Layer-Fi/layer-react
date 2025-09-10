import { AccountingConfigurationSchemaType, AccountingConfigurationSchema } from '../../schemas/accountingConfiguration'
import { get } from '../../api/layer/authenticated_http'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import useSWR, { type SWRResponse } from 'swr'
import { Schema } from 'effect/index'

export const ACCOUNTING_CONFIGURATION_TAG_KEY = '#accounting-configuration'

class AccountingConfigurationSWRResponse {
  private swrResponse: SWRResponse<AccountingConfigurationSchemaType>
  private cacheKey: { readonly accessToken: string
    readonly apiUrl: string
    readonly businessId: string
  } | undefined

  constructor(swrResponse: SWRResponse<AccountingConfigurationSchemaType>,
    key: { readonly accessToken: string
      readonly apiUrl: string
      readonly businessId: string
    } | undefined) {
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
    return `accessToken:${this.cacheKey.accessToken}-apiUrl:${this.cacheKey.apiUrl}-businessId:${this.cacheKey.businessId}`
  }
}

type GetAccountingConfigurationParams = {
  businessId: string
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tag: [ACCOUNTING_CONFIGURATION_TAG_KEY],
    } as const
  }
}

const getAccountingConfiguration = get<{ data: AccountingConfigurationSchemaType }, GetAccountingConfigurationParams>(
  ({ businessId }) => {
    return `/v1/businesses/${businessId}/accounting-config`
  },
)

export function useAccountingConfiguration({ businessId }: GetAccountingConfigurationParams) {
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const queryKey = buildKey({
    ...auth,
    apiUrl,
    businessId,
  })

  const response = useSWR(
    () => queryKey,
    ({ accessToken, apiUrl, businessId }) => getAccountingConfiguration(
      apiUrl,
      accessToken,
      {
        params: {
          businessId: businessId,
        },
      },
    )().then(({ data }) => Schema.decodeUnknownPromise(AccountingConfigurationSchema)(data)),
  )

  return new AccountingConfigurationSWRResponse(response, queryKey)
}
