import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { BookkeepingStatus, BookkeepingStatusResponseSchema } from '@schemas/bookkeepingStatus'
import { get } from '@utils/api/authenticatedHttp'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
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

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [BOOKKEEPING_TAG_KEY, BOOKKEEPING_STATUS_TAG_KEY],
    } as const
  }
}

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

export function useBookkeepingStatusGlobalCacheActions() {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadBookkeepingStatus = useCallback(
    () => forceReload(({ tags }) => tags.includes(BOOKKEEPING_STATUS_TAG_KEY)),
    [forceReload],
  )

  return { forceReloadBookkeepingStatus }
}

export function useEffectiveBookkeepingStatus(): BookkeepingStatus {
  const { overrideMode } = useLegacyMode()
  const { data } = useBookkeepingStatus()

  if (overrideMode === 'bookkeeping-client') {
    return BookkeepingStatus.ACTIVE
  }

  return data?.status ?? BookkeepingStatus.NOT_PURCHASED
}
