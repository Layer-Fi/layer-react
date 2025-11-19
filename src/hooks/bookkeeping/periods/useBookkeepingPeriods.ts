import useSWR from 'swr'

import type { RawTask } from '@internal-types/tasks'
import type { EnumWithUnknownValues } from '@internal-types/utility/enumWithUnknownValues'
import { isActiveOrPausedBookkeepingStatus } from '@utils/bookkeeping/bookkeepingStatusFilters'
import { isActiveBookkeepingPeriod } from '@utils/bookkeeping/periods/getFilteredBookkeepingPeriods'
import { getUserVisibleTasks } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { get } from '@api/layer/authenticated_http'
import {
  BOOKKEEPING_TAG_KEY,
  useBookkeepingStatus,
} from '@hooks/bookkeeping/useBookkeepingStatus'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export enum BookkeepingPeriodStatus {
  BOOKKEEPING_NOT_ACTIVE = 'BOOKKEEPING_NOT_ACTIVE',
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS_AWAITING_BOOKKEEPER = 'IN_PROGRESS_AWAITING_BOOKKEEPER',
  IN_PROGRESS_AWAITING_CUSTOMER = 'IN_PROGRESS_AWAITING_CUSTOMER',
  CLOSING_IN_REVIEW = 'CLOSING_IN_REVIEW',
  CLOSED_OPEN_TASKS = 'CLOSED_OPEN_TASKS',
  CLOSED_COMPLETE = 'CLOSED_COMPLETE',
}
const BOOKKEEPING_PERIOD_STATUSES: string[] = Object.values(BookkeepingPeriodStatus)

type RawBookkeepingPeriodStatus = EnumWithUnknownValues<BookkeepingPeriodStatus>

function isBookkeepingPeriodStatus(status: RawBookkeepingPeriodStatus): status is BookkeepingPeriodStatus {
  return BOOKKEEPING_PERIOD_STATUSES.includes(status)
}

function constrainToKnownBookkeepingPeriodStatus(status: RawBookkeepingPeriodStatus): BookkeepingPeriodStatus {
  if (isBookkeepingPeriodStatus(status)) {
    return status
  }

  return BookkeepingPeriodStatus.BOOKKEEPING_NOT_ACTIVE
}

export type BookkeepingPeriod = Omit<RawBookkeepingPeriod, 'status'> & {
  status: BookkeepingPeriodStatus
}

type RawBookkeepingPeriod = {
  id: string
  month: number
  year: number
  status: RawBookkeepingPeriodStatus
  tasks: ReadonlyArray<RawTask>
}

const getBookkeepingPeriods = get<
  {
    data: {
      periods: ReadonlyArray<RawBookkeepingPeriod>
    }
  },
  { businessId: string }
>(({ businessId }) => {
  return `/v1/businesses/${businessId}/bookkeeping/periods`
})

export const BOOKKEEPING_PERIODS_TAG_KEY = '#bookkeeping-periods'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  isActiveOrPaused,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  isActiveOrPaused: boolean
}) {
  if (accessToken && apiUrl && isActiveOrPaused) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [BOOKKEEPING_TAG_KEY, BOOKKEEPING_PERIODS_TAG_KEY],
    } as const
  }
}

export function useBookkeepingPeriods() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const { data, isLoading: isLoadingBookkeepingStatus } = useBookkeepingStatus()
  const isActiveOrPaused = data ? isActiveOrPausedBookkeepingStatus(data.status) : false

  const swrResponse = useSWR(
    () => buildKey({
      ...auth,
      businessId,
      isActiveOrPaused,
    }),
    ({ accessToken, apiUrl, businessId }) => getBookkeepingPeriods(
      apiUrl,
      accessToken,
      { params: { businessId } },
    )()
      .then(
        ({ data: { periods } }) =>
          periods
            .map(period => ({
              ...period,
              status: constrainToKnownBookkeepingPeriodStatus(period.status),
              tasks: getUserVisibleTasks(period.tasks),
            }))
            .filter(period => isActiveBookkeepingPeriod(period)),
      ),
  )

  return new Proxy(swrResponse, {
    get(target, prop) {
      if (prop === 'isLoading') {
        return isLoadingBookkeepingStatus || swrResponse.isLoading
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
