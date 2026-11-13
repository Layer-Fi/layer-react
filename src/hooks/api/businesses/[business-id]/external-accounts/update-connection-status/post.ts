import { Schema } from 'effect'

import { type UpdateConnectionStatusBody, UpdateConnectionStatusBodySchema } from '@schemas/features/linkedAccounts/updateConnectionStatus'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPDATE_CONNECTION_STATUS_TAG_KEY = '#update-connection-status'

const updateConnectionStatus = post<
  Record<string, unknown>,
  typeof UpdateConnectionStatusBodySchema.Encoded,
  { businessId: string }
>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/external-accounts/update-connection-status`,
)

export const usePostUpdateConnectionStatus = createMutationHook({
  tags: [UPDATE_CONNECTION_STATUS_TAG_KEY],
  request: updateConnectionStatus,
  argToBody: (arg?: UpdateConnectionStatusBody) =>
    (arg?.connectionExternalId ? Schema.encodeSync(UpdateConnectionStatusBodySchema)(arg) : undefined),
})
