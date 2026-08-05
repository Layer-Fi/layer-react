import type { S3PresignedUrl } from '@internal-types/general'
import { getAsMutation } from '@utils/shared/api/getAsMutation'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import type { GetStatementOfCashFlowParams } from '@api/businesses/[business-id]/reports/cashflow-statement/get'

const getCashflowStatementCSV = getWithQuery<
  { data: S3PresignedUrl },
  GetStatementOfCashFlowParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/cashflow-statement/exports/csv`,
)

const requestCashflowStatementCSV = getAsMutation(getCashflowStatementCSV)

export const useGetCashflowStatementDownload = createMutationHook({
  tags: ['#download-cashflow-statement'],
  request: requestCashflowStatementCSV,
  keyParams: ['startDate', 'endDate'],
  argToBody: (_arg: undefined) => undefined,
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})
