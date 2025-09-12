import { AccountingConfigurationSchemaType, AccountingConfigurationSchema } from '../../schemas/accountingConfiguration'
import { get } from '../../api/layer/authenticated_http'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import useSWR, { type SWRResponse } from 'swr'
import { Schema } from 'effect/index'

export const ACCOUNTING_CONFIGURATION_TAG_KEY = '#accounting-configuration'

class AccountingConfigurationSWRResponse {
  private swrResponse: SWRResponse<AccountingConfigurationSchemaType>

  constructor(swrResponse: SWRResponse<AccountingConfigurationSchemaType>) {
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

type GetAccountingConfigurationParams = {
  businessId: string
}

function buildKey({
  accessToken,
  apiUrl,
  businessId,
}: {
  accessToken?: string
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
          businessId,
        },
      },
    )().then(({ data }) => Schema.decodeUnknownPromise(AccountingConfigurationSchema)(data)),
  )

  return new AccountingConfigurationSWRResponse(response)
}
