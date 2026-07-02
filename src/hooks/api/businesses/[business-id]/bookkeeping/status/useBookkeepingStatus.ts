import { BookkeepingStatus, type BookkeepingStatusData, BookkeepingStatusResponseSchema } from '@schemas/bookkeepingStatus'
import { get } from '@utils/api/authenticatedHttp'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { useLegacyMode } from '@providers/LegacyModeProvider/LegacyModeProvider'

export { BookkeepingStatus }

const getBookkeepingStatus = get<
  typeof BookkeepingStatusResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => {
  return `/v1/businesses/${businessId}/bookkeeping/status`
})

export const BOOKKEEPING_TAG_KEY = '#bookkeeping'
export const BOOKKEEPING_STATUS_TAG_KEY = '#bookkeeping-status'

export const useBookkeepingStatus = createQueryHook({
  tags: [BOOKKEEPING_TAG_KEY, BOOKKEEPING_STATUS_TAG_KEY],
  request: getBookkeepingStatus,
  schema: BookkeepingStatusResponseSchema,
  select: ({ data }) => data,
  isLocalized: false,
})

export const useBookkeepingStatusGlobalCacheActions = createResourceGlobalCacheActions<BookkeepingStatusData>(BOOKKEEPING_STATUS_TAG_KEY)

export function useEffectiveBookkeepingStatus(): BookkeepingStatus {
  const { overrideMode } = useLegacyMode()
  const { data } = useBookkeepingStatus()

  if (overrideMode === 'bookkeeping-client') {
    return BookkeepingStatus.ACTIVE
  }

  return data?.status ?? BookkeepingStatus.NOT_PURCHASED
}
