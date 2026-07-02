import {
  type BookkeepingConfiguration,
  BookkeepingConfigurationResponseSchema,
  BookkeepingStatus,
  TransactionTaggingStrategy,
} from '@schemas/bookkeepingConfiguration'
import { get } from '@utils/api/authenticatedHttp'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export type { BookkeepingConfiguration }
export { BookkeepingStatus, TransactionTaggingStrategy }

export const BOOKKEEPING_CONFIGURATION_TAG_KEY = '#bookkeeping-configuration'

type GetBookkeepingConfigurationParams = {
  businessId: string
}

const getBookkeepingConfiguration = get<
  typeof BookkeepingConfigurationResponseSchema.Encoded,
  GetBookkeepingConfigurationParams
>(({ businessId }) => {
  return `/v1/businesses/${businessId}/bookkeeping/config`
})

export const useBookkeepingConfiguration = createQueryHook({
  tags: [BOOKKEEPING_CONFIGURATION_TAG_KEY],
  request: getBookkeepingConfiguration,
  schema: BookkeepingConfigurationResponseSchema,
  select: ({ data }) => data,
})
