import type { S3PresignedUrl } from '../../types/general'
import { get } from './authenticated_http'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import type { BalanceSheet } from '../../types/balance_sheet'

type GetBalanceSheetParams = {
  businessId: string
  effectiveDate: Date
}

export const getBalanceSheet = get<
  { data: BalanceSheet },
  GetBalanceSheetParams
>(
  ({ businessId, effectiveDate }) => {
    const parameters = toDefinedSearchParameters({ effectiveDate })

    return `/v1/businesses/${businessId}/reports/balance-sheet?${parameters}`
  },
)

export const getBalanceSheetCSV = get<
  { data: S3PresignedUrl },
  GetBalanceSheetParams
>(
  ({ businessId, effectiveDate }) => {
    const parameters = toDefinedSearchParameters({ effectiveDate })

    return `/v1/businesses/${businessId}/reports/balance-sheet/exports/csv?${parameters}`
  },
)

export const getBalanceSheetExcel = get<
  { data: S3PresignedUrl },
  GetBalanceSheetParams
>(
  ({ businessId, effectiveDate }) => {
    const parameters = toDefinedSearchParameters({ effectiveDate })

    return `/v1/businesses/${businessId}/reports/balance-sheet/exports/excel?${parameters}`
  },
)
