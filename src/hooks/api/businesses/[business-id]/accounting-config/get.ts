import useSWR from 'swr'

import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { AccountingConfigurationSchema } from '@schemas/features/business/accountingConfiguration'
import { get } from '@utils/shared/api/authenticatedHttp'
import { createBuildKey } from '@utils/shared/swr/createBuildKey'
import { createKeyedFetcher } from '@utils/shared/swr/createKeyedFetcher'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { SWRQueryResult } from '@hooks/utils/swr/SWRResponseTypes'

export const ACCOUNTING_CONFIGURATION_TAG_KEY = '#accounting-configuration'

type GetAccountingConfigurationParams = {
  businessId: string
}

const buildKey = createBuildKey<{ businessId: string }>([ACCOUNTING_CONFIGURATION_TAG_KEY])

const GetAccountingConfigurationResponseSchema = UnwrappedDataResponseSchema(AccountingConfigurationSchema)

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
  GetAccountingConfigurationResponseSchema,
)

export function useGetAccountingConfiguration({ businessId }: GetAccountingConfigurationParams) {
  const { data: auth } = useAuth()

  const queryKey = buildKey({ ...auth, businessId })
  const response = useSWR(() => queryKey, fetchAccountingConfiguration)

  return new SWRQueryResult(response)
}
