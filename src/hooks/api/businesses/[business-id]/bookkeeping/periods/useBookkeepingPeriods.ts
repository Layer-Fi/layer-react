import { Schema } from 'effect'

import type { EnumWithUnknownValues } from '@internal-types/utility/enumWithUnknownValues'
import { BusinessTaskSchema } from '@schemas/businessTasks/businessTask'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { get } from '@utils/api/authenticatedHttp'
import { isActiveOrPausedBookkeepingStatus } from '@utils/bookkeeping/bookkeepingStatusFilters'
import { isActiveBookkeepingPeriod } from '@utils/bookkeeping/periods/getFilteredBookkeepingPeriods'
import { getUserVisibleTasks } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import {
  BOOKKEEPING_TAG_KEY,
  useBookkeepingStatus,
} from '@hooks/api/businesses/[business-id]/bookkeeping/status/useBookkeepingStatus'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export enum BookkeepingPeriodStatus {
  BOOKKEEPING_NOT_ACTIVE = 'BOOKKEEPING_NOT_ACTIVE',
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS_AWAITING_BOOKKEEPER = 'IN_PROGRESS_AWAITING_BOOKKEEPER',
  IN_PROGRESS_AWAITING_CUSTOMER = 'IN_PROGRESS_AWAITING_CUSTOMER',
  CLOSING_IN_REVIEW = 'CLOSING_IN_REVIEW',
  CLOSING_OPEN_ITEMS = 'CLOSING_OPEN_ITEMS',
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

const RawBookkeepingPeriodSchema = Schema.Struct({
  id: Schema.String,
  month: Schema.Number,
  year: Schema.Number,
  status: Schema.String,
  tasks: Schema.Array(BusinessTaskSchema),
})
type RawBookkeepingPeriod = typeof RawBookkeepingPeriodSchema.Type

const BookkeepingPeriodsResponseSchema = UnwrappedDataResponseSchema(Schema.Struct({
  periods: Schema.Array(RawBookkeepingPeriodSchema),
}))

const getBookkeepingPeriods = get<
  typeof BookkeepingPeriodsResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => {
  return `/v1/businesses/${businessId}/bookkeeping/periods`
})

export const BOOKKEEPING_PERIODS_TAG_KEY = '#bookkeeping-periods'

export const useBookkeepingPeriodsGlobalCacheActions =
  createResourceGlobalCacheActions<ReadonlyArray<BookkeepingPeriod>>(BOOKKEEPING_PERIODS_TAG_KEY)

const useBookkeepingPeriodsQuery = createQueryHook({
  tags: [BOOKKEEPING_TAG_KEY, BOOKKEEPING_PERIODS_TAG_KEY],
  request: getBookkeepingPeriods,
  schema: BookkeepingPeriodsResponseSchema,
  select: ({ periods }) =>
    periods
      .map(period => ({
        ...period,
        status: constrainToKnownBookkeepingPeriodStatus(period.status),
        tasks: getUserVisibleTasks(period.tasks),
      }))
      .filter(period => isActiveBookkeepingPeriod(period)),
})

export function useBookkeepingPeriods() {
  const { data, isLoading: isLoadingBookkeepingStatus } = useBookkeepingStatus()
  const isActiveOrPaused = data ? isActiveOrPausedBookkeepingStatus(data.status) : false

  const queryResult = useBookkeepingPeriodsQuery({ isEnabled: isActiveOrPaused })

  return new Proxy(queryResult, {
    get(target, prop) {
      if (prop === 'isLoading') {
        return isLoadingBookkeepingStatus || target.isLoading
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
