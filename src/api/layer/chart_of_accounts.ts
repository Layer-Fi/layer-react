import { ChartOfAccounts } from '../../types'
import { get } from './authenticated_http'

export const getChartOfAccounts = get<{ data: ChartOfAccounts }>(
  ({ businessId }) =>
    `https://sandbox.layerfi.com/v1/businesses/${businessId}/ledger/accounts`,
)
