import { Schema } from 'effect'

import { type MileageSummary, MileageSummarySchema } from '@schemas/mileage'
import { get } from '@utils/api/authenticatedHttp'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const MILEAGE_SUMMARY_TAG_KEY = '#mileage-summary'

const MileageSummaryResponseSchema = Schema.Struct({
  data: MileageSummarySchema,
})

const getMileageSummary = get<
  typeof MileageSummaryResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/mileage/summary`)

export const useMileageSummary = createQueryHook({
  tags: [MILEAGE_SUMMARY_TAG_KEY],
  request: getMileageSummary,
  schema: MileageSummaryResponseSchema.pipe(Schema.pluck('data')),
})

export const useMileageSummaryGlobalCacheActions = createResourceGlobalCacheActions<MileageSummary>(MILEAGE_SUMMARY_TAG_KEY)
