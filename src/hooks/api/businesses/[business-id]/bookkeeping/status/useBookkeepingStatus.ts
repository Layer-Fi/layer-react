import { BookkeepingStatus, type BookkeepingStatusData, BookkeepingStatusDataSchema } from '@schemas/bookkeepingStatus'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { get } from '@utils/api/authenticatedHttp'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'
import { useLegacyMode } from '@providers/LegacyModeProvider/LegacyModeProvider'

export { BookkeepingStatus }

const BookkeepingStatusResponseSchema = UnwrappedDataResponseSchema(BookkeepingStatusDataSchema)

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
