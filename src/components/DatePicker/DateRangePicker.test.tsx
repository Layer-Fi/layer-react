import { useCallback, useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { describe, expect, it, vi } from 'vitest'

import { type DateRange } from '@utils/date/dateRange'
import { DateRangePicker } from '@components/DatePicker/DateRangePicker'

vi.mock('@hooks/utils/dates/useBusinessDatePickerBounds', () => {
  const bounds = { minDate: null, maxDate: new Date(2027, 0, 1) }
  return { useBusinessDatePickerBounds: () => bounds }
})

const INITIAL_RANGE: DateRange = {
  startDate: new Date(2026, 0, 1),
  endDate: new Date(2026, 0, 31),
}

function PlainStateParent({ onSetDateRange }: { onSetDateRange: (range: DateRange) => void }) {
  const [range, setRange] = useState(INITIAL_RANGE)

  const setDateRange = useCallback((next: DateRange) => {
    onSetDateRange(next)
    setRange(next)
  }, [onSetDateRange])

  return (
    <IntlProvider locale='en'>
      <DateRangePicker dateRange={range} setDateRange={setDateRange} />
    </IntlProvider>
  )
}

describe('DateRangePicker', () => {
  it('does not re-render endlessly with a plain useState parent', () => {
    const onSetDateRange = vi.fn((_range: DateRange) => {
      // Circuit-breaker so a regression fails fast instead of hanging the run
      if (onSetDateRange.mock.calls.length > 25) {
        throw new Error('render loop detected: setDateRange called more than 25 times')
      }
    })

    render(<PlainStateParent onSetDateRange={onSetDateRange} />)

    // The picker starts in sync with the incoming range, so mounting should
    // not push any update back to the parent.
    expect(onSetDateRange).not.toHaveBeenCalled()
  })

  it('does not echo an externally-updated range back to the parent', () => {
    const setDateRange = vi.fn()

    const { rerender } = render(
      <IntlProvider locale='en'>
        <DateRangePicker dateRange={INITIAL_RANGE} setDateRange={setDateRange} />
      </IntlProvider>,
    )

    rerender(
      <IntlProvider locale='en'>
        <DateRangePicker
          dateRange={{ startDate: new Date(2026, 1, 1), endDate: new Date(2026, 1, 28) }}
          setDateRange={setDateRange}
        />
      </IntlProvider>,
    )

    expect(setDateRange).not.toHaveBeenCalled()
  })

  it('still propagates local edits to the parent', () => {
    const onSetDateRange = vi.fn()

    render(<PlainStateParent onSetDateRange={onSetDateRange} />)

    // Bump the day segment of the start date field
    const daySegment = screen
      .getAllByRole('spinbutton')
      .find(segment => segment.getAttribute('data-type') === 'day')

    expect(daySegment).toBeDefined()
    fireEvent.keyDown(daySegment!, { key: 'ArrowUp' })

    expect(onSetDateRange).toHaveBeenCalledTimes(1)
    expect(onSetDateRange).toHaveBeenLastCalledWith({
      startDate: new Date(2026, 0, 2),
      endDate: INITIAL_RANGE.endDate,
    })
  })
})
