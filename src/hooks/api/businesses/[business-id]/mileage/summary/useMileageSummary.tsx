import { type MileageSummary, MileageSummarySchema } from '@schemas/mileage'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { get } from '@utils/api/authenticatedHttp'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const MILEAGE_SUMMARY_TAG_KEY = '#mileage-summary'

const MileageSummaryResponseSchema = UnwrappedDataResponseSchema(MileageSummarySchema)

const getMileageSummary = get<
  typeof MileageSummaryResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/mileage/summary`)

export const useMileageSummary = createQueryHook({
  tags: [MILEAGE_SUMMARY_TAG_KEY],
  request: getMileageSummary,
  schema: MileageSummaryResponseSchema,
})

export const useMileageSummaryGlobalCacheActions = createResourceGlobalCacheActions<MileageSummary>(MILEAGE_SUMMARY_TAG_KEY)
