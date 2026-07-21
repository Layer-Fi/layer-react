import useSWR from 'swr'

import { SWRQueryResult } from '@internal-types/swr/SWRResponseTypes'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createKeyedFetcher } from '@utils/swr/createKeyedFetcher'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { OverviewSchema } from '@schemas/overview/overview'

export const OVERVIEW_CONFIGURATION_TAG_KEY = '#overview-configuration'

type GetOverviewConfigurationParams = {
  businessId: string
}

const buildKey = createBuildKey<{ businessId: string }>([OVERVIEW_CONFIGURATION_TAG_KEY])

const GetOverviewConfigurationResponseSchema = UnwrappedDataResponseSchema(OverviewSchema)

const getOverviewConfiguration = get<
  typeof GetOverviewConfigurationResponseSchema.Encoded,
  GetOverviewConfigurationParams
>(
  ({ businessId }) => {
    return `/v1/businesses/${businessId}/overview`
  },
)

const fetchAccountingConfiguration = createKeyedFetcher(
  getOverviewConfiguration,
  GetOverviewConfigurationResponseSchema,
)

export function useOverviewConfiguration({ businessId }: GetOverviewConfigurationParams) {
  const { data: auth } = useAuth()

  const queryKey = buildKey({ ...auth, businessId })
  const response = useSWR(() => queryKey, fetchAccountingConfiguration)

  return new SWRQueryResult(response)
}
