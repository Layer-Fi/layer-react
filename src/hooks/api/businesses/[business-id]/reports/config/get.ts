import { ReportConfigResponseSchema } from '@schemas/unifiedReports/reportConfig'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const REPORT_CONFIG_TAG_KEY = '#report-config'

type GetReportConfigParams = {
  businessId: string
}

const getReportConfig = getWithQuery<
  typeof ReportConfigResponseSchema.Encoded,
  GetReportConfigParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/config`,
)

export const useGetReportConfig = createQueryHook({
  tags: [REPORT_CONFIG_TAG_KEY],
  request: getReportConfig,
  schema: ReportConfigResponseSchema,
})
