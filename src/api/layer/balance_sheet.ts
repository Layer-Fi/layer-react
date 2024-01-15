// import { BalanceSheet } from '../../types'
// import { get } from './authenticated_http'
import { BalanceSheet } from '../../types'
import Data from './balance_sheet.json'

// export const getBalanceSheet = get<{
//   data?: BalanceSheet
//   error?: unknown
// }>(
//   ({ businessId }) =>
//     `https://sandbox.layerfi.com/v1/businesses/${businessId}/balances`,
// )

export interface GetBalanceSheetParams {
  businessId: string
  date: string
}

export const getBalanceSheet =
  (_token: string, _params: { params: GetBalanceSheetParams }) => () =>
    Data as unknown as BalanceSheet
