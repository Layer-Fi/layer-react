import { Account, LedgerAccounts, NewAccount, EditAccount } from '../../types'
import { get, post, put } from './authenticated_http'

export const getLedgerAccounts = get<{ data: LedgerAccounts }>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)

export const createAccount = post<{ data: Account }, NewAccount>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)

export const updateAccount = put<{ data: Account }, EditAccount>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/ledger/accounts/${accountId}`,
)
