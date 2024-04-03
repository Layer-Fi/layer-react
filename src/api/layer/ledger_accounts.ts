import { Account, LedgerAccounts, NewAccount } from '../../types'
import { get, post } from './authenticated_http'

export const getLedgerAccounts = get<{ data: LedgerAccounts }>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)

export const createAccount = post<{ data: Account }, NewAccount>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)
