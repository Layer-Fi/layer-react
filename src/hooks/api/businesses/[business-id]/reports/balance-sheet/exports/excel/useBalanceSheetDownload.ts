import type { S3PresignedUrl } from '@internal-types/general'
import { getWithQuery } from '@utils/api/getWithQuery'
import { getAsMutation } from '@utils/api/postAsQuery'
import type { GetBalanceSheetParams } from '@hooks/api/businesses/[business-id]/reports/balance-sheet/useBalanceSheet'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const getBalanceSheetExcel = getWithQuery<
  { data: S3PresignedUrl },
  GetBalanceSheetParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/balance-sheet/exports/excel`,
)

const requestBalanceSheetExcel = getAsMutation(getBalanceSheetExcel)

export const useBalanceSheetDownload = createMutationHook({
  tags: ['#download-balance-sheet'],
  request: requestBalanceSheetExcel,
  keyParams: ['effectiveDate'],
  argToBody: (_arg: undefined) => undefined,
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})
