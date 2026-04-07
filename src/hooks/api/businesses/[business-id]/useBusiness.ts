import { Schema } from 'effect'
import useSWR from 'swr'

import { BusinessResponseSchema } from '@schemas/business'
import { get } from '@utils/api/authenticatedHttp'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'

export const BUSINESS_TAG_KEY = '#business'

const getBusiness = get(
  ({ businessId }: { businessId: string }) => `/v1/businesses/${businessId}`,
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

  return useSWR(
    () => buildKey({ accessToken: auth?.access_token, apiUrl, businessId }),
    ({ accessToken, apiUrl, businessId }) =>
      getBusiness(apiUrl, accessToken, { params: { businessId } })()
        .then(Schema.decodeUnknownPromise(BusinessResponseSchema)),
  )
}
