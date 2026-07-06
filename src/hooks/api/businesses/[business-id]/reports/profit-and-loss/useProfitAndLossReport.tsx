import { type ProfitAndLoss, type ProfitAndLossReportRequestParams, ProfitAndLossReportSchema } from '@schemas/reports/profitAndLoss'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const PNL_REPORT_TAG_KEY = '#profit-and-loss-report'

const ProfitAndLossReportResponseSchema = UnwrappedDataResponseSchema(ProfitAndLossReportSchema)

const getProfitAndLoss = getWithQuery<
  typeof ProfitAndLossReportResponseSchema.Encoded,
  ProfitAndLossReportRequestParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/profit-and-loss`,
)

export const useProfitAndLossReport = createQueryHook({
  tags: [PNL_REPORT_TAG_KEY],
  request: getProfitAndLoss,
  schema: ProfitAndLossReportResponseSchema,
})

export const useProfitAndLossReportCacheActions = createResourceGlobalCacheActions<ProfitAndLoss>(PNL_REPORT_TAG_KEY)
