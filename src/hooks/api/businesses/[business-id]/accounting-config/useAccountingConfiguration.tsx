import { Schema } from 'effect'
import useSWR from 'swr'

import { AccountingConfigurationSchema } from '@schemas/accountingConfiguration'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createKeyedFetcher } from '@utils/swr/createKeyedFetcher'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'

export const ACCOUNTING_CONFIGURATION_TAG_KEY = '#accounting-configuration'

type GetAccountingConfigurationParams = {
  businessId: string
}

const buildKey = createBuildKey<{ businessId: string }>([ACCOUNTING_CONFIGURATION_TAG_KEY])

const GetAccountingConfigurationResponseSchema = Schema.Struct({
  data: AccountingConfigurationSchema,
})

const getAccountingConfiguration = get<
  typeof GetAccountingConfigurationResponseSchema.Encoded,
  GetAccountingConfigurationParams
>(
  ({ businessId }) => {
    return `/v1/businesses/${businessId}/accounting-config`
  },
)

const fetchAccountingConfiguration = createKeyedFetcher(
  getAccountingConfiguration,
  GetAccountingConfigurationResponseSchema.pipe(Schema.pluck('data')),
)

export function useAccountingConfiguration({ businessId }: GetAccountingConfigurationParams) {
  const { data: auth } = useAuth()

  const queryKey = buildKey({
    ...auth,
    businessId,
  })

  const response = useSWR(
    () => queryKey,
    fetchAccountingConfiguration,
  )
  return new SWRQueryResult(response)
}
