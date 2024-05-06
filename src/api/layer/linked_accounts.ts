import { LinkedAccounts, PublicToken } from '../../types/linked_accounts'
import { get, post, deleteRequest } from './authenticated_http'

export const getLinkedAccounts = get<
  { data: LinkedAccounts },
  {
    businessId: string
  }
>(
  ({ businessId }) => `/v1/businesses/${businessId}/external-accounts`,
)

export const confirmConnection = post<
  Record<string, unknown>,
  Record<string, unknown>,
  {
    businessId: string
    accountId: string
  }
>(
  ({businessId, accountId}) => `/v1/businesses/${businessId}/external-accounts/${accountId}/confirm`
)

export const denyConnection = post<
  Record<string, unknown>,
  Record<string, unknown>,
  {
    businessId: string
    accountId: string
  }
>(
  ({businessId, accountId}) => `/v1/businesses/${businessId}/external-accounts/${accountId}/confirm`
)

// TODO: not implemented yet in backend
export const unlinkConnection = deleteRequest<
  Record<string, unknown>,
  Record<string, unknown>,
  {
    businessId: string
    connectionId: string
  }
>(
  ({ businessId, connectionId }) =>
    `/v1/businesses/${businessId}/plaid/external-accounts/connection/${connectionId}/archive`,
)

export const unlinkAccount = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string; accountId: string }
>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/external-accounts/${accountId}/archive`,
)


/**********************
 * Plaid Specific API *
 **********************/

export const getPlaidLinkToken = post<
  {
    data: {
      type: 'Link_Token'
      link_token: string
    },
  },
  Record<string, unknown>,
  {
    businessId: string
  }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link`)

export const getPlaidUpdateModeLinkToken = post<
  {
    data: {
      type: 'Link_Token'
      link_token: string
    },
  },
  Record<string, unknown>,
  {
    businessId: string
  }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/update-mode-link`)

export const exchangePlaidPublicToken = post<
  Record<string, unknown>,
  PublicToken,
  {
    businessId: string
  }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link/exchange`)

// TODO: Delete once "unlinkConnection" is online
export const unlinkPlaidItem = deleteRequest<
  Record<string, unknown>,
  Record<string, unknown>,
  {
    businessId: string
    plaidItemId: string
  }
>(
  ({ businessId, plaidItemId }) =>
    `/v1/businesses/${businessId}/plaid/items/${plaidItemId}`,
)

// export const createAccount = post<{ data: LinkedAccount }, NewAccount>(
//   ({ businessId }) => `/v1/businesses/${businessId}/external-accounts`,
// )
