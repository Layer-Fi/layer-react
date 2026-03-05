import { Schema } from 'effect/index'
import useSWR from 'swr'

import { AccountingConfigurationSchema, type AccountingConfigurationSchemaType } from '@schemas/accountingConfiguration'
import { get } from '@utils/authenticatedHttp'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'

export const ACCOUNTING_CONFIGURATION_TAG_KEY = '#accounting-configuration'

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
          businessId,
        },
      },
    )().then(({ data }) => Schema.decodeUnknownPromise(AccountingConfigurationSchema)(data)),
  )
  return new SWRQueryResult(response)
}
