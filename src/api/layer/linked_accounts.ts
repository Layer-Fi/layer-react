import { LinkedAccounts, PublicToken } from '../../types/linked_accounts'
import { get, post, deleteRequest } from './authenticated_http'

export const getLinkedAccounts = get<{ data: LinkedAccounts }>(
  ({ businessId }) => `/v1/businesses/${businessId}/external-accounts`,
)

export const getPlaidLinkToken = post<{
  data: {
    type: 'Link_Token'
    link_token: string
  }
}>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link`)

export const exchangePlaidPublicToken = post<
  Record<string, unknown>,
  PublicToken
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link/exchange`)

/**
 * This is named per plaid terminology. It means unlinking an institution
 */
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

export const unlinkPlaidAccount = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string; accountId: string }
>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/plaid/accounts/${accountId}/archive`,
)

// export const createAccount = post<{ data: LinkedAccount }, NewAccount>(
//   ({ businessId }) => `/v1/businesses/${businessId}/external-accounts`,
// )
