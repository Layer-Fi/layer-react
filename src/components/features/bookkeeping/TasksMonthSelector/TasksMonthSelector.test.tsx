import { type PropsWithChildren } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type LayerEvent, LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { type BookkeepingPeriod, BookkeepingPeriodStatus } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { TasksMonthSelector } from '@features/bookkeeping/TasksMonthSelector/TasksMonthSelector'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { fixtureId, makeUnifiedAskFormTask } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { get as getBookkeepingPeriods } from '@msw/api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { server } from '@msw/node'
import { NOW } from '@testUtils/dates/fixedDates'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

// `shouldAdvanceTime` avoids stalling MSW-backed `findBy*` polling, unlike plain `setupFakeSystemTime`
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

const PERIODS: BookkeepingPeriod[] = [
  {
    id: 'period-may',
    year: 2026,
    month: 5,
    status: BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER,
    tasks: [
      makeUnifiedAskFormTask({ id: fixtureId('d01'), status: BusinessTaskStatus.Todo }),
      makeUnifiedAskFormTask({ id: fixtureId('d02'), status: BusinessTaskStatus.Todo }),
    ],
  },
]

const renderTasksMonthSelector = (onEvent?: (event: LayerEvent) => void) => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

  server.use(getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })))
  server.use(getBookkeepingPeriods.mock(PERIODS))

  const wrapper = ({ children }: PropsWithChildren) => (
    <LayerTestProvider eventCallbacks={onEvent ? { onEvent } : undefined}>{children}</LayerTestProvider>
  )

  return {
    user,
    ...render(<TasksMonthSelector isMobile={false} />, { wrapper }),
  }
}

const monthTile = (monthStr: string) =>
  screen.getByText(monthStr).closest('.Layer__tasks-month-selector__month') as HTMLElement

describe('TasksMonthSelector', () => {
  it('renders a tile for every month of the active year and marks the current month active', async () => {
    renderTasksMonthSelector()

    expect(await screen.findByText('Jun')).toBeInTheDocument()
    ;['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].forEach((month) => {
      expect(screen.getByText(month)).toBeInTheDocument()
    })

    expect(monthTile('Jun')).toHaveAttribute('data-active', 'true')
  })

  it('shows the open-task count for a month with an awaiting-customer period', async () => {
    renderTasksMonthSelector()

    expect(await screen.findByText('2 tasks')).toBeInTheDocument()
  })

  it('does nothing when a month with no bookkeeping period is clicked', async () => {
    const onEvent = vi.fn<(event: LayerEvent) => void>()
    const { user } = renderTasksMonthSelector(onEvent)
    await screen.findByText('2 tasks')

    await user.click(monthTile('Jan'))

    expect(onEvent).not.toHaveBeenCalled()
    expect(monthTile('Jun')).toHaveAttribute('data-active', 'true')
  })

  it('selects a month with an active period and emits a TaskMonthSelected event', async () => {
    const onEvent = vi.fn<(event: LayerEvent) => void>()
    const { user } = renderTasksMonthSelector(onEvent)
    await screen.findByText('2 tasks')

    await user.click(monthTile('May'))

    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: LayerEventType.TaskMonthSelected,
        version: 1,
        payload: { year: 2026, month: 5 },
        metadata: expect.objectContaining({ component: LayerEventComponent.Tasks }) as object,
      }),
    )
    expect(monthTile('May')).toHaveAttribute('data-active', 'true')
  })
})
