// import { BalanceSheet } from '../../types'
// import { get } from './authenticated_http'
import Data from './balance_sheet.json'

// export const getBalanceSheet = get<{
//   data?: BalanceSheet
//   error?: unknown
// }>(
//   ({ businessId }) =>
//     `https://sandbox.layerfi.com/v1/businesses/${businessId}/balances`,
// )

export const getBalanceSheet = (_token: string, _params: any) => () => Data
