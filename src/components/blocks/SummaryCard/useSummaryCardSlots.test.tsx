import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { useSummaryCardSlots } from '@blocks/SummaryCard/useSummaryCardSlots'

import { NOW } from '@testUtils/dates/fixedDates'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'

/*
 * `setupFakeSystemTime` uses plain `vi.useFakeTimers()`, which stalls `renderHookWithAuth`'s
 * internal `waitFor` polling. `shouldAdvanceTime` keeps real timers ticking under the pinned
 * clock, so the global date store's "this month" default still resolves deterministically.
 */
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useSummaryCardSlots', () => {
  it('uses the default title and formats the subtitle from the global date', async () => {
    const { result } = await renderHookWithAuth(() =>
      useSummaryCardSlots({ defaultTitle: 'Revenue' }),
    )

    expect(result.current.title).toBe('Revenue')
    expect(result.current.subtitle).toBe('June 2026')
    expect(result.current.legend).toBeUndefined()
    expect(result.current.primaryAction).toBeUndefined()
  })

  it('prefers a title override over the default title', async () => {
    const { result } = await renderHookWithAuth(() =>
      useSummaryCardSlots({ defaultTitle: 'Revenue', stringOverrides: { title: 'Net income' } }),
    )

    expect(result.current.title).toBe('Net income')
  })

  it('passes the legend through unchanged', async () => {
    const legend = 'Legend content'

    const { result } = await renderHookWithAuth(() =>
      useSummaryCardSlots({ defaultTitle: 'Revenue', legend }),
    )

    expect(result.current.legend).toBe(legend)
  })

  it('formats the subtitle using the given date format', async () => {
    const { result } = await renderHookWithAuth(() =>
      useSummaryCardSlots({ defaultTitle: 'Revenue', subtitleDateFormat: DateFormat.MonthYearShort }),
    )

    expect(result.current.subtitle).toBe('Jun 2026')
  })

  it('builds an expand action only when onClickExpand is given, and invokes it when pressed', async () => {
    const { result: withoutHandler } = await renderHookWithAuth(() =>
      useSummaryCardSlots({ defaultTitle: 'Revenue' }),
    )

    expect(withoutHandler.current.primaryAction).toBeUndefined()

    const onClickExpand = vi.fn()

    const { result: withHandler } = await renderHookWithAuth(() =>
      useSummaryCardSlots({ defaultTitle: 'Revenue', interactionProps: { onClickExpand } }),
    )

    expect(withHandler.current.primaryAction).toBeDefined()
  })
})
