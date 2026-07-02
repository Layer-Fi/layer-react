import type { S3PresignedUrl } from '@internal-types/general'
import { getWithQuery } from '@utils/api/getWithQuery'
import type { MutationRequest } from '@utils/api/postAsQuery'
import type { GetStatementOfCashFlowParams } from '@hooks/api/businesses/[business-id]/reports/cashflow-statement/useStatementOfCashFlow'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const getCashflowStatementCSV = getWithQuery<
  { data: S3PresignedUrl },
  GetStatementOfCashFlowParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/cashflow-statement/exports/csv`,
)

const requestCashflowStatementCSV: MutationRequest<
  { data: S3PresignedUrl },
  Record<string, unknown>,
  GetStatementOfCashFlowParams
> = (baseUrl, accessToken, options) =>
  getCashflowStatementCSV(baseUrl, accessToken, { params: options?.params })()

export const useCashflowStatementDownload = createMutationHook({
  tags: ['#download-cashflow-statement'],
  request: requestCashflowStatementCSV,
  keyParams: ['startDate', 'endDate'],
  argToBody: (_arg: undefined) => undefined,
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})
