import { AccountAlternate, ChartOfAccounts, NewAccount } from '../../types'
import { get, post } from './authenticated_http'

export const getChartOfAccounts = get<{ data: ChartOfAccounts }>(
  ({ businessId }) =>
    `https://sandbox.layerfi.com/v1/businesses/${businessId}/ledger/accounts`,
)

export const createAccount = post<{ data: AccountAlternate }, NewAccount>(
  ({ businessId }) =>
    `https://sandbox.layerfi.com/v1/businesses/${businessId}/ledger/accounts`,
)
