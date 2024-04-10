import { LinkedAccounts } from '../../types/linked_accounts'
import { get, post } from './authenticated_http'

export const getLinkedAccounts = get<{ data: LinkedAccounts }>(
  ({ businessId }) => `/v1/businesses/${businessId}/external-accounts`,
)

// export const createAccount = post<{ data: LinkedAccount }, NewAccount>(
//   ({ businessId }) => `/v1/businesses/${businessId}/external-accounts`,
// )
