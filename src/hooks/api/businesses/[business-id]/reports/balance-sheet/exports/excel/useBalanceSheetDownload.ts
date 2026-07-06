import type { S3PresignedUrl } from '@internal-types/general'
import { getAsMutation } from '@utils/api/getAsMutation'
import { getWithQuery } from '@utils/api/getWithQuery'
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
  keyParamNames: ['effectiveDate'],
  argToBody: (_arg: undefined) => undefined,
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})
