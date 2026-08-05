import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type ProfitAndLoss, ProfitAndLossReportSchema } from '@schemas/profitAndLoss/profitAndLoss'
import { type ProfitAndLossReportRequestParams } from '@schemas/profitAndLoss/profitAndLossRequestParams'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'

export const PNL_REPORT_TAG_KEY = '#profit-and-loss-report'

const ProfitAndLossReportResponseSchema = UnwrappedDataResponseSchema(ProfitAndLossReportSchema)

const getProfitAndLoss = getWithQuery<
  typeof ProfitAndLossReportResponseSchema.Encoded,
  ProfitAndLossReportRequestParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/profit-and-loss`,
)

export const useGetProfitAndLossReport = createQueryHook({
  tags: [PNL_REPORT_TAG_KEY],
  request: getProfitAndLoss,
  schema: ProfitAndLossReportResponseSchema,
})

export const useProfitAndLossReportCacheActions = createResourceGlobalCacheActions<ProfitAndLoss>(PNL_REPORT_TAG_KEY)
