import type { S3PresignedUrl } from '@internal-types/general'
import { getAsMutation } from '@utils/api/getAsMutation'
import { getWithQuery } from '@utils/api/getWithQuery'
import type { GetStatementOfCashFlowParams } from '@hooks/api/businesses/[business-id]/reports/cashflow-statement/useStatementOfCashFlow'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const getCashflowStatementCSV = getWithQuery<
  { data: S3PresignedUrl },
  GetStatementOfCashFlowParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/cashflow-statement/exports/csv`,
)

const requestCashflowStatementCSV = getAsMutation(getCashflowStatementCSV)

export const useCashflowStatementDownload = createMutationHook({
  tags: ['#download-cashflow-statement'],
  request: requestCashflowStatementCSV,
  keyParamNames: ['startDate', 'endDate'],
  argToBody: (_arg: undefined) => undefined,
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})
