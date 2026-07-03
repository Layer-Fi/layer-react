import useSWR from 'swr'

import { BusinessResponseSchema } from '@schemas/business'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createKeyedFetcher } from '@utils/swr/createKeyedFetcher'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'

export const BUSINESS_TAG_KEY = '#business'

const getBusiness = get<
  typeof BusinessResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}`)

const buildKey = createBuildKey<{ businessId: string }>([BUSINESS_TAG_KEY])

const fetchBusiness = createKeyedFetcher(getBusiness, BusinessResponseSchema)

export function useBusiness({ businessId }: { businessId: string }) {
  const { data: auth } = useAuth()

  const swrResponse = useSWR(
    () => buildKey({ ...auth, businessId }),
    fetchBusiness,
  )

  return new SWRQueryResult(swrResponse)
}
