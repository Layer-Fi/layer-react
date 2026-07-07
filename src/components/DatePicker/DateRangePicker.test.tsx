import { type ReactElement, useCallback, useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { type DateRange } from '@utils/date/dateRange'
import { DateRangePicker } from '@components/DatePicker/DateRangePicker'

import { LayerTestProvider } from '@test-utils/LayerTestProvider'

const INITIAL_RANGE: DateRange = {
  startDate: new Date(2026, 0, 1),
  endDate: new Date(2026, 0, 31),
}

const UPDATED_RANGE: DateRange = {
  startDate: new Date(2026, 1, 1),
  endDate: new Date(2026, 1, 28),
}

function PlainStateParent({ onSetDateRange }: { onSetDateRange: (range: DateRange) => void }) {
  const [range, setRange] = useState(INITIAL_RANGE)

  const setDateRange = useCallback((next: DateRange) => {
    onSetDateRange(next)
    setRange(next)
  }, [onSetDateRange])

  return <DateRangePicker dateRange={range} setDateRange={setDateRange} />
}

const renderDateRangePicker = (ui: ReactElement) => {
  const user = userEvent.setup()

  return {
    user,
    ...render(ui, { wrapper: LayerTestProvider }),
  }
}

const getDaySegment = (pickerName: string) =>
  within(screen.getByRole('group', { name: pickerName }))
    .getByRole('spinbutton', { name: /day/i })

describe('DateRangePicker', () => {
  it('does not re-render endlessly with a plain useState parent', () => {
    const onSetDateRange = vi.fn((_range: DateRange) => {
      // Circuit-breaker so a regression fails fast instead of hanging the run
      if (onSetDateRange.mock.calls.length > 25) {
        throw new Error('render loop detected: setDateRange called more than 25 times')
      }
    })

    renderDateRangePicker(<PlainStateParent onSetDateRange={onSetDateRange} />)

    // The picker starts in sync with the incoming range, so mounting should
    // not push any update back to the parent.
    expect(screen.getByRole('group', { name: 'Start date' })).toBeInTheDocument()
    expect(onSetDateRange).not.toHaveBeenCalled()
  })

  it('does not echo an externally-updated range back to the parent', () => {
    const setDateRange = vi.fn()

    const { rerender } = renderDateRangePicker(
      <DateRangePicker dateRange={INITIAL_RANGE} setDateRange={setDateRange} />,
    )

    rerender(<DateRangePicker dateRange={UPDATED_RANGE} setDateRange={setDateRange} />)

    expect(setDateRange).not.toHaveBeenCalled()
  })

  it('still propagates local edits to the parent', async () => {
    const onSetDateRange = vi.fn()

    const { user } = renderDateRangePicker(<PlainStateParent onSetDateRange={onSetDateRange} />)

    // Bump the day segment of the start date field
    const daySegment = getDaySegment('Start date')

    await user.click(daySegment)
    await user.keyboard('{ArrowUp}')

    expect(onSetDateRange).toHaveBeenCalledTimes(1)
    expect(onSetDateRange).toHaveBeenLastCalledWith({
      startDate: new Date(2026, 0, 2),
      endDate: INITIAL_RANGE.endDate,
    })
  })
})
