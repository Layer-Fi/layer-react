import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type MileageSummary, MileageSummarySchema } from '@schemas/features/mileage/mileage'
import { get } from '@utils/shared/api/authenticatedHttp'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'

export const MILEAGE_SUMMARY_TAG_KEY = '#mileage-summary'

const MileageSummaryResponseSchema = UnwrappedDataResponseSchema(MileageSummarySchema)

const getMileageSummary = get<
  typeof MileageSummaryResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/mileage/summary`)

export const useGetMileageSummary = createQueryHook({
  tags: [MILEAGE_SUMMARY_TAG_KEY],
  request: getMileageSummary,
  schema: MileageSummaryResponseSchema,
})

export const useMileageSummaryGlobalCacheActions = createResourceGlobalCacheActions<MileageSummary>(MILEAGE_SUMMARY_TAG_KEY)
