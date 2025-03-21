import useSWR from 'swr'
import { useLayerContext } from '../../../contexts/LayerContext'
import { useAuth } from '../../useAuth'
import { get } from '../../../api/layer/authenticated_http'
import {
  isActiveBookkeepingStatus,
  useBookkeepingStatus,
} from '../useBookkeepingStatus'
import type { Task } from '../../../types/tasks'
import type { EnumWithUnknownValues } from '../../../types/utility/enumWithUnknownValues'

const BOOKKEEPING_PERIOD_STATUSES = [
  'BOOKKEEPING_NOT_PURCHASED',
  'NOT_STARTED',
  'IN_PROGRESS_NO_TASKS',
  'IN_PROGRESS_OPEN_TASKS',
  'CLOSED_IN_REVIEW',
  'CLOSED_OPEN_TASKS',
  'CLOSED_COMPLETE',
] as const

export type BookkeepingPeriodStatus = typeof BOOKKEEPING_PERIOD_STATUSES[number]
type RawBookkeepingPeriodStatus = EnumWithUnknownValues<BookkeepingPeriodStatus>

function constrainToKnownBookkeepingPeriodStatus(status: string): BookkeepingPeriodStatus {
  if (BOOKKEEPING_PERIOD_STATUSES.includes(status as BookkeepingPeriodStatus)) {
    return status as BookkeepingPeriodStatus
  }

  return 'BOOKKEEPING_NOT_PURCHASED'
}

type BookkeepingPeriod = {
  id: string
  month: number
  year: number
  status: RawBookkeepingPeriodStatus
  tasks: ReadonlyArray<Task>
}

const getBookkeepingPeriods = get<
  {
    data: {
      periods: ReadonlyArray<BookkeepingPeriod>
    }
  },
  { businessId: string }
>(({ businessId }) => {
  return `/v1/businesses/${businessId}/bookkeeping/periods`
})

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  isActive,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  isActive: boolean
}) {
  if (accessToken && apiUrl && isActive) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: ['#bookkeeping', '#periods'],
    } as const
  }
}

export function useBookkeepingPeriods() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const { data } = useBookkeepingStatus()
  const isActive = data ? isActiveBookkeepingStatus(data.status) : false

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
      isActive,
    }),
    ({ accessToken, apiUrl, businessId }) => getBookkeepingPeriods(
      apiUrl,
      accessToken,
      { params: { businessId } },
    )()
      .then(
        ({ data: { periods } }) => periods.map(period => ({
          ...period,
          status: constrainToKnownBookkeepingPeriodStatus(period.status),
        })),
      ),
  )
}
