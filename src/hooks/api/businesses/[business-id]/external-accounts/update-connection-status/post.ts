import { post } from '@utils/shared/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/shared/request/toDefinedSearchParameters'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPDATE_CONNECTION_STATUS_TAG_KEY = '#update-connection-status'

type UpdateConnectionStatusParams = { businessId: string, connectionExternalId?: string }
type UpdateConnectionStatusArg = { connectionExternalId?: string } | undefined

const updateConnectionStatus = post<
  Record<string, unknown>,
  Record<string, unknown>,
  UpdateConnectionStatusParams
>(
  ({ businessId, connectionExternalId }) => {
    const query = toDefinedSearchParameters({ connectionExternalId }).toString()
    return `/v1/businesses/${businessId}/external-accounts/update-connection-status${query ? `?${query}` : ''}`
  },
)

export const usePostUpdateConnectionStatus = createMutationHook<
  Record<string, unknown>,
  Record<string, unknown>,
  UpdateConnectionStatusParams,
  Record<string, unknown>,
  UpdateConnectionStatusArg
>({
  tags: [UPDATE_CONNECTION_STATUS_TAG_KEY],
  request: updateConnectionStatus,
  argToParams: arg => ({ connectionExternalId: arg?.connectionExternalId }),
  argToBody: () => undefined,
})
