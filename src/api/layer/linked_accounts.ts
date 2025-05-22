import { LinkedAccounts, PublicToken } from '../../types/linked_accounts'
import { get, post } from './authenticated_http'
import type { OneOf } from '../../types/utility/oneOf'

export const syncConnection = post<
  Record<string, unknown>,
  Record<string, unknown>,
  {
    businessId: string
  }
>(({ businessId }) => `/v1/businesses/${businessId}/sync`)

export const updateConnectionStatus = post<
  Record<string, unknown>,
  Record<string, unknown>,
  {
    businessId: string
  }
>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/external-accounts/update-connection-status`,
)

type UpdateOpeningBalanceBody = {
  effective_at: string
  balance: number
}

export const updateOpeningBalance = post<
  never,
  UpdateOpeningBalanceBody,
  {
    businessId: string
    accountId: string
  }
>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/external-accounts/${accountId}/opening-balance`,
)

export const listExternalAccounts = get<
  { data: LinkedAccounts },
  {
    businessId: string
  }
>(({ businessId }) => `/v1/businesses/${businessId}/external-accounts`)

type ConfirmAccountBodyStrict = OneOf<[
  { is_unique: true },
  { is_relevant: true },
]>

export const confirmAccount = post<
  never,
  ConfirmAccountBodyStrict,
  {
    businessId: string
    accountId: string
  }
>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/external-accounts/${accountId}/confirm`,
)

type ExcludeAccountBodyStrict = OneOf<[
  { is_irrelevant: true },
  { is_duplicate: true },
]>

export const excludeAccount = post<
  never,
  ExcludeAccountBodyStrict,
  {
    businessId: string
    accountId: string
  }
>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/external-accounts/${accountId}/exclude`,
)

// TODO: not implemented yet in backend
export const unlinkConnection = post<
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
  { businessId: string, accountId: string }
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
    }
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
    }
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

// TODO: Delete once "unlinkConnection" is online. unlinkConnection is broader and would be able
// to handle other providers like Stripe as well as Plaid
export const unlinkPlaidItem = post<
  Record<string, unknown>,
  Record<string, unknown>,
  {
    businessId: string
    plaidItemPlaidId: string
  }
>(
  ({ businessId, plaidItemPlaidId }) =>
    `/v1/businesses/${businessId}/plaid/items/${plaidItemPlaidId}/unlink`,
)

// Only works in non-production environments
export const breakPlaidItemConnection = post<
  Record<string, unknown>,
  Record<string, unknown>,
  {
    businessId: string
    plaidItemPlaidId: string
  }
>(
  ({ businessId, plaidItemPlaidId }) =>
    `/v1/businesses/${businessId}/plaid/items/${plaidItemPlaidId}/sandbox-reset-item-login`,
)

// export const createAccount = post<{ data: LinkedAccount }, NewAccount>(
//   ({ businessId }) => `/v1/businesses/${businessId}/external-accounts`,
// )
