import { post } from '@utils/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPDATE_CONNECTION_STATUS_TAG_KEY = '#update-connection-status'

const updateConnectionStatus = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string }
>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/external-accounts/update-connection-status`,
)

export const useUpdateConnectionStatus = createMutationHook<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string },
  Record<string, unknown>,
  never
>({
  tags: [UPDATE_CONNECTION_STATUS_TAG_KEY],
  request: updateConnectionStatus,
})
