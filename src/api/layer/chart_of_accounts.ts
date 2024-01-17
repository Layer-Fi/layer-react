import { AccountAlternate, ChartOfAccounts, NewAccount } from '../../types'
import { get, post } from './authenticated_http'

export const getChartOfAccounts = get<{ data: ChartOfAccounts }>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)

export const createAccount = post<{ data: AccountAlternate }, NewAccount>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)
