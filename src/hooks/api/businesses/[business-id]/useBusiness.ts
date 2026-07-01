import { Schema } from 'effect'
import useSWR from 'swr'

import { type Business, BusinessResponseSchema } from '@schemas/business'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const BUSINESS_TAG_KEY = '#business'

const getBusiness = get<{ data: Business }>(
  ({ businessId }) => `/v1/businesses/${businessId}`,
)

const buildKey = createBuildKey<{ businessId: string }>([BUSINESS_TAG_KEY])

export function useBusiness({ businessId }: { businessId: string }) {
  const { auth } = useBuildKeyInputs()

  const swrResponse = useSWR(
    () => buildKey({ ...auth, businessId }),
    ({ accessToken, apiUrl, businessId }) =>
      getBusiness(apiUrl, accessToken, { params: { businessId } })()
        .then(Schema.decodeUnknownPromise(BusinessResponseSchema)),
  )

  return new SWRQueryResult(swrResponse)
}
