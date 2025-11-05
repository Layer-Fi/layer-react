import useSWR from 'swr'
import { useLayerContext } from '../../contexts/LayerContext/LayerContext'
import { useAuth } from '../useAuth'
import { get } from '../../api/layer/authenticated_http'
import type { EnumWithUnknownValues } from '../../types/utility/enumWithUnknownValues'
import { useLegacyMode } from '../../providers/LegacyModeProvider/LegacyModeProvider'

export enum BookkeepingStatus {
  NOT_PURCHASED = 'NOT_PURCHASED',
  ACTIVE = 'ACTIVE',
  ONBOARDING = 'ONBOARDING',
  BOOKKEEPING_PAUSED = 'BOOKKEEPING_PAUSED',
}
const BOOKKEEPING_STATUSES: string[] = Object.values(BookkeepingStatus)

type RawBookkeepingStatus = EnumWithUnknownValues<BookkeepingStatus>

function isBookkeepingStatus(status: RawBookkeepingStatus): status is BookkeepingStatus {
  return BOOKKEEPING_STATUSES.includes(status)
}

function constrainToKnownBookkeepingStatus(status: RawBookkeepingStatus): BookkeepingStatus {
  if (isBookkeepingStatus(status)) {
    return status
  }

  return BookkeepingStatus.NOT_PURCHASED
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
    return BookkeepingStatus.ACTIVE
  }

  return data?.status ?? BookkeepingStatus.NOT_PURCHASED
}
