import { Schema } from 'effect/index'
import useSWR from 'swr'

import { AccountingConfigurationSchema, type AccountingConfigurationSchemaType } from '@schemas/accountingConfiguration'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const ACCOUNTING_CONFIGURATION_TAG_KEY = '#accounting-configuration'

type GetAccountingConfigurationParams = {
  businessId: string
}

const buildKey = createBuildKey<{ businessId: string }>([ACCOUNTING_CONFIGURATION_TAG_KEY])

const getAccountingConfiguration = get<{ data: AccountingConfigurationSchemaType }, GetAccountingConfigurationParams>(
  ({ businessId }) => {
    return `/v1/businesses/${businessId}/accounting-config`
  },
)

export function useAccountingConfiguration({ businessId }: GetAccountingConfigurationParams) {
  const { apiUrl, auth } = useBuildKeyInputs()

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
