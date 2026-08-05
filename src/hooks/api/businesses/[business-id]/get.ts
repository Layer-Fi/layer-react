import useSWR from 'swr'

import { BusinessResponseSchema } from '@schemas/features/business/business'
import { get } from '@utils/shared/api/authenticatedHttp'
import { createBuildKey } from '@utils/shared/swr/createBuildKey'
import { createKeyedFetcher } from '@utils/shared/swr/createKeyedFetcher'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { SWRQueryResult } from '@hooks/utils/swr/SWRResponseTypes'

export const BUSINESS_TAG_KEY = '#business'

const getBusiness = get<
  typeof BusinessResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}`)

const buildKey = createBuildKey<{ businessId: string }>([BUSINESS_TAG_KEY])

const fetchBusiness = createKeyedFetcher(getBusiness, BusinessResponseSchema)

export function useGetBusiness({ businessId }: { businessId: string }) {
  const { data: auth } = useAuth()

  const swrResponse = useSWR(
    () => buildKey({ ...auth, businessId }),
    fetchBusiness,
  )

  return new SWRQueryResult(swrResponse)
}
