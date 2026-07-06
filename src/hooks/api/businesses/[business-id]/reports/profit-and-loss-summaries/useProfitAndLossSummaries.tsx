import { type ProfitAndLossSummaries, type ProfitAndLossSummariesRequestParams, ProfitAndLossSummariesSchema } from '@schemas/reports/profitAndLoss'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const PNL_SUMMARIES_TAG_KEY = '#profit-and-loss-summaries'

const ProfitAndLossSummariesResponseSchema = UnwrappedDataResponseSchema(ProfitAndLossSummariesSchema)

const getProfitAndLossSummaries = getWithQuery<
  typeof ProfitAndLossSummariesResponseSchema.Encoded,
  ProfitAndLossSummariesRequestParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/profit-and-loss-summaries`,
)

export const useProfitAndLossSummaries = createQueryHook({
  tags: [PNL_SUMMARIES_TAG_KEY],
  request: getProfitAndLossSummaries,
  schema: ProfitAndLossSummariesResponseSchema,
})

export const useProfitAndLossSummariesCacheActions = createResourceGlobalCacheActions<ProfitAndLossSummaries>(PNL_SUMMARIES_TAG_KEY)
