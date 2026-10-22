import useSWR from 'swr'

import { useAuthInput } from '@providers/global/AuthInput/AuthInputProvider'
import { useEnvironment } from '@providers/global/Environment/EnvironmentInputProvider'

export const AUTH_TAG_KEY = '#auth'

const DEFAULT_EXPIRES_IN_SECONDS = 3600

export function useAuth() {
  const { apiUrl } = useEnvironment()
  const { businessAccessToken } = useAuthInput()

  return useSWR(
    () => businessAccessToken
      ? { apiUrl, businessAccessToken, tags: [AUTH_TAG_KEY] }
      : null,
    ({ apiUrl, businessAccessToken }) => ({
      apiUrl,
      access_token: businessAccessToken,
      expires_in: DEFAULT_EXPIRES_IN_SECONDS,
      token_type: 'Bearer' as const,
    }),
    {
      keepPreviousData: true,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  )
}
