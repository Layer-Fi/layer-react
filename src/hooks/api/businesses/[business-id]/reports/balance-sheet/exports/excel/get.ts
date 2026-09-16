import type { S3PresignedUrl } from '@internal-types/shared/s3PresignedUrl'
import { getAsMutation } from '@utils/shared/api/getAsMutation'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import type { GetBalanceSheetParams } from '@api/businesses/[business-id]/reports/balance-sheet/get'

const getBalanceSheetExcel = getWithQuery<
  { data: S3PresignedUrl },
  GetBalanceSheetParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/balance-sheet/exports/excel`,
)

const requestBalanceSheetExcel = getAsMutation(getBalanceSheetExcel)

export const useGetBalanceSheetDownload = createMutationHook({
  tags: ['#download-balance-sheet'],
  request: requestBalanceSheetExcel,
  keyParams: ['effectiveDate'],
  argToBody: (_arg: undefined) => undefined,
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})
