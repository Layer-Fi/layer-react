import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { useSummaryCardSlots } from '@blocks/SummaryCard/useSummaryCardSlots'

import { NOW } from '@testUtils/dates/fixedDates'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'

// `shouldAdvanceTime` avoids stalling renderHookWithAuth's internal `waitFor` polling, unlike plain `setupFakeSystemTime`
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

type UseSummaryCardSlotsParams = Parameters<typeof useSummaryCardSlots>[0]

const DEFAULT_PARAMS: UseSummaryCardSlotsParams = {
  defaultTitle: 'Revenue',
}

const renderSlots = (params: Partial<UseSummaryCardSlotsParams> = {}) =>
  renderHookWithAuth(() => useSummaryCardSlots({ ...DEFAULT_PARAMS, ...params }))

describe('useSummaryCardSlots', () => {
  it('uses the default title and formats the subtitle from the global date', async () => {
    const { result } = await renderSlots()

    expect(result.current.title).toBe('Revenue')
    expect(result.current.subtitle).toBe('June 2026')
    expect(result.current.legend).toBeUndefined()
    expect(result.current.primaryAction).toBeUndefined()
  })

  it('prefers a title override over the default title', async () => {
    const { result } = await renderSlots({ stringOverrides: { title: 'Net income' } })

    expect(result.current.title).toBe('Net income')
  })

  it('passes the legend through unchanged', async () => {
    const legend = 'Legend content'

    const { result } = await renderSlots({ legend })

    expect(result.current.legend).toBe(legend)
  })

  it('formats the subtitle using the given date format', async () => {
    const { result } = await renderSlots({ subtitleDateFormat: DateFormat.MonthYearShort })

    expect(result.current.subtitle).toBe('Jun 2026')
  })

  it('builds no expand action when onClickExpand is omitted', async () => {
    const { result } = await renderSlots()

    expect(result.current.primaryAction).toBeUndefined()
  })

  it('builds an expand action that invokes onClickExpand when pressed', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onClickExpand = vi.fn()

    const { result } = await renderSlots({ interactionProps: { onClickExpand } })

    render(<>{result.current.primaryAction}</>, { wrapper: LayerTestProvider })

    await user.click(screen.getByRole('button', { name: 'View' }))

    expect(onClickExpand).toHaveBeenCalledTimes(1)
  })
})
