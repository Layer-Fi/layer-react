import useSWR from 'swr'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { get } from '../../api/layer/authenticated_http'
import type { EnumWithUnknownValues } from '../../types/utility/enumWithUnknownValues'
import { useLegacyMode } from '../../providers/LegacyModeProvider/LegacyModeProvider'

const BOOKKEEPING_STATUSES = [
  'NOT_PURCHASED',
  'ACTIVE',
  'ONBOARDING',
  'BOOKKEEPING_PAUSED',
] as const

export type BookkeepingStatus = typeof BOOKKEEPING_STATUSES[number]
type RawBookkeepingStatus = EnumWithUnknownValues<BookkeepingStatus>

function constrainToKnownBookkeepingStatus(status: string): BookkeepingStatus {
  if (BOOKKEEPING_STATUSES.includes(status as BookkeepingStatus)) {
    return status as BookkeepingStatus
  }

  return 'NOT_PURCHASED'
}

const getBookkeepingStatus = get<
  {
    data: {
      status: RawBookkeepingStatus
    }
  },
  { businessId: string }
>(({ businessId }) => {
  return `/v1/businesses/${businessId}/bookkeeping/status`
})

export const BOOKKEEPING_TAG_KEY = '#bookkeeping'
const BOOKKEEPING_STATUS_TAG_KEY = '#bookkeeping-status'

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
      .then(({ data }) => ({
        ...data,
        status: constrainToKnownBookkeepingStatus(data.status),
      })),
  )
}

export function useEffectiveBookkeepingStatus() {
  const { overrideMode } = useLegacyMode()
  const { data } = useBookkeepingStatus()

  if (overrideMode === 'bookkeeping-client') {
    return 'ACTIVE'
  }

  return data?.status ?? 'NOT_PURCHASED'
}
