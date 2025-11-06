import type { StatusOfQuickbooksConnection } from '@internal-types/quickbooks'
import { get, post } from '@api/layer/authenticated_http'

export const syncFromQuickbooks = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/quickbooks/sync-from`)

export const initQuickbooksOAuth = post<
  {
    data: {
      type: 'Quickbooks_Authorization_Params'
      redirect_url: string
    }
  },
  Record<string, unknown>,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/quickbooks/authorize`)

export const unlinkQuickbooksConnection = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/quickbooks/unlink`)

/**
 * Lets user know if there exists an active Quickbooks connection or not
 */
export const statusOfQuickbooksConnection = get<
  {
    data: StatusOfQuickbooksConnection
  },
  { businessId: string }
>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/quickbooks/connection-status`,
)
