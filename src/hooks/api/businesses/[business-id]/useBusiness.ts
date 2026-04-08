import { Schema } from 'effect'
import useSWR from 'swr'

import { type Business, BusinessResponseSchema } from '@schemas/business'
import { get } from '@utils/api/authenticatedHttp'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'

export const BUSINESS_TAG_KEY = '#business'

const getBusiness = get<{ data: Business }>(
  ({ businessId }) => `/v1/businesses/${businessId}`,
)

function buildKey({
  accessToken,
  apiUrl,
  businessId,
}: {
  accessToken?: string
  apiUrl: string
  businessId: string
}) {
  if (!accessToken) return null

  return {
    accessToken,
    apiUrl,
    businessId,
    tags: [BUSINESS_TAG_KEY],
  } as const
}

export function useBusiness({ businessId }: { businessId: string }) {
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const swrResponse = useSWR(
    () => buildKey({ accessToken: auth?.access_token, apiUrl, businessId }),
    ({ accessToken, apiUrl, businessId }) =>
      getBusiness(apiUrl, accessToken, { params: { businessId } })()
        .then(Schema.decodeUnknownPromise(BusinessResponseSchema)),
  )

  return new SWRQueryResult(swrResponse)
}
