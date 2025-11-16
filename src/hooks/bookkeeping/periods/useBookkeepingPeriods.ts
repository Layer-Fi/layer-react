import useSWR from 'swr'
import { Schema } from 'effect'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useAuth } from '@hooks/useAuth'
import { get } from '@api/layer/authenticated_http'
import {
  BOOKKEEPING_TAG_KEY,
  useBookkeepingStatus,
} from '@hooks/bookkeeping/useBookkeepingStatus'
import { isActiveOrPausedBookkeepingStatus } from '@utils/bookkeeping/bookkeepingStatusFilters'
import { getUserVisibleTasks } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { isActiveBookkeepingPeriod } from '@utils/bookkeeping/periods/getFilteredBookkeepingPeriods'
import {
  ListBookkeepingPeriodsResponse,
  ListBookkeepingPeriodsResponseSchema,
} from '@schemas/bookkeepingPeriods'

const getBookkeepingPeriods = get<
  ListBookkeepingPeriodsResponse,
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

  if (businessId) {
    return {
      accessToken: '',
      apiUrl: '',
      businessId,
      tags: [BOOKKEEPING_TAG_KEY, BOOKKEEPING_PERIODS_TAG_KEY],
    } as const
  }

  return null
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
      .then(Schema.decodeUnknownPromise(ListBookkeepingPeriodsResponseSchema))
      .then(({ data: { periods } }) =>
        periods
          .map(period => ({
            ...period,
            tasks: getUserVisibleTasks(period.tasks),
          }))
          .filter(period => isActiveBookkeepingPeriod(period)),
      ),
    // () =>
    //   Promise.resolve(MOCK_BOOKKEEPING_PERIODS_RESPONSE)
    //     .then(({ data: { periods } }) =>
    //       periods
    //         .map(period => ({
    //           ...period,
    //           tasks: getUserVisibleTasks(period.tasks),
    //         }))
    //         .filter(period => isActiveBookkeepingPeriod(period)),
    //     )),
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
