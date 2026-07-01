import { Schema } from 'effect'
import useSWR from 'swr'

import { BookkeepingStatus, type BookkeepingStatusData, BookkeepingStatusResponseSchema } from '@schemas/bookkeepingStatus'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLegacyMode } from '@providers/LegacyModeProvider/LegacyModeProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export { BookkeepingStatus }

const getBookkeepingStatus = get<
  Record<string, unknown>,
  { businessId: string }
>(({ businessId }) => {
  return `/v1/businesses/${businessId}/bookkeeping/status`
})

export const BOOKKEEPING_TAG_KEY = '#bookkeeping'
export const BOOKKEEPING_STATUS_TAG_KEY = '#bookkeeping-status'

const buildKey = createBuildKey<{ businessId: string }>([BOOKKEEPING_TAG_KEY, BOOKKEEPING_STATUS_TAG_KEY])

export function useBookkeepingStatus() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
    }),
    ({ accessToken, apiUrl, businessId }) => getBookkeepingStatus(
      apiUrl,
      accessToken,
      { params: { businessId } },
    )()
      .then(Schema.decodeUnknownPromise(BookkeepingStatusResponseSchema))
      .then(({ data }) => data),
  )
}

export const useBookkeepingStatusGlobalCacheActions = createResourceGlobalCacheActions<BookkeepingStatusData>(BOOKKEEPING_STATUS_TAG_KEY)

export function useEffectiveBookkeepingStatus(): BookkeepingStatus {
  const { overrideMode } = useLegacyMode()
  const { data } = useBookkeepingStatus()

  if (overrideMode === 'bookkeeping-client') {
    return BookkeepingStatus.ACTIVE
  }

  return data?.status ?? BookkeepingStatus.NOT_PURCHASED
}
