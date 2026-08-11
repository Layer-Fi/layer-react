import { type PropsWithChildren } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { DEFAULT_CHART_COLORS, UNCATEGORIZED_CHART_COLOR } from '@utils/shared/styles/chartColors'
import {
  ProfitAndLossChartConfigProvider,
  useProfitAndLossChartPalette,
  useProfitAndLossDonutChartConfig,
  useProfitAndLossTrendChartConfig,
} from '@providers/features/profitAndLoss/ProfitAndLossChartConfigContext/ProfitAndLossChartConfigContext'

function makeWrapper(props: { chartConfig?: ProfitAndLossChartConfig, chartColorsList?: string[] }) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <ProfitAndLossChartConfigProvider {...props}>{children}</ProfitAndLossChartConfigProvider>
  }
}

describe('useProfitAndLossChartPalette', () => {
  const chartConfig: ProfitAndLossChartConfig = {
    colors: { revenue: ['#111111'], expenses: ['#222222'], uncategorized: '#333333' },
  }

  it('picks the palette matching the scope', () => {
    const wrapper = makeWrapper({ chartConfig })

    expect(renderHook(() => useProfitAndLossChartPalette('revenue'), { wrapper }).result.current.palette)
      .toEqual(['#111111'])
    expect(renderHook(() => useProfitAndLossChartPalette('expenses'), { wrapper }).result.current.palette)
      .toEqual(['#222222'])
  })

  it('falls back to the legacy flat list for whichever scope is omitted', () => {
    const wrapper = makeWrapper({
      chartConfig: { colors: { expenses: ['#222222'] } },
      chartColorsList: ['#444444'],
    })

    expect(renderHook(() => useProfitAndLossChartPalette('revenue'), { wrapper }).result.current.palette)
      .toEqual(['#444444'])
    expect(renderHook(() => useProfitAndLossChartPalette('expenses'), { wrapper }).result.current.palette)
      .toEqual(['#222222'])
  })

  it('applies the legacy flat list to both scopes when it is the only source', () => {
    const flat = ['#444444', '#555555']
    const wrapper = makeWrapper({ chartColorsList: flat })

    expect(renderHook(() => useProfitAndLossChartPalette('revenue'), { wrapper }).result.current.palette)
      .toEqual(flat)
    expect(renderHook(() => useProfitAndLossChartPalette('expenses'), { wrapper }).result.current.palette)
      .toEqual(flat)
  })

  it('falls back to the default palette when nothing is configured', () => {
    const wrapper = makeWrapper({})

    expect(renderHook(() => useProfitAndLossChartPalette('revenue'), { wrapper }).result.current.palette)
      .toEqual(DEFAULT_CHART_COLORS)
  })

  it('falls back to the default palette when the configured list is empty', () => {
    const wrapper = makeWrapper({ chartConfig: { colors: { revenue: [] } } })

    expect(renderHook(() => useProfitAndLossChartPalette('revenue'), { wrapper }).result.current.palette)
      .toEqual(DEFAULT_CHART_COLORS)
  })

  it('resolves the uncategorized color and reports whether it was overridden', () => {
    const overridden = renderHook(
      () => useProfitAndLossChartPalette('revenue'),
      { wrapper: makeWrapper({ chartConfig }) },
    ).result.current

    expect(overridden.uncategorized).toBe('#333333')
    expect(overridden.uncategorizedOverride).toBe('#333333')

    const defaulted = renderHook(
      () => useProfitAndLossChartPalette('revenue'),
      { wrapper: makeWrapper({ chartConfig: { colors: { revenue: ['#111111'] } } }) },
    ).result.current

    expect(defaulted.uncategorized).toBe(UNCATEGORIZED_CHART_COLOR)
    expect(defaulted.uncategorizedOverride).toBeUndefined()
  })

  it('falls back to defaults outside a provider', () => {
    const { result } = renderHook(() => useProfitAndLossChartPalette('expenses'))

    expect(result.current.palette).toEqual(DEFAULT_CHART_COLORS)
    expect(result.current.uncategorized).toBe(UNCATEGORIZED_CHART_COLOR)
  })
})

describe('chart-specific config hooks', () => {
  it('exposes the trend and donut sections', () => {
    const wrapper = makeWrapper({
      chartConfig: {
        trendChart: { barSize: 36 },
        donutChart: { innerRadius: '70%', outerRadius: '100%' },
      },
    })

    expect(renderHook(() => useProfitAndLossTrendChartConfig(), { wrapper }).result.current)
      .toEqual({ barSize: 36 })
    expect(renderHook(() => useProfitAndLossDonutChartConfig(), { wrapper }).result.current)
      .toEqual({ innerRadius: '70%', outerRadius: '100%' })
  })

  it('returns an empty section when unconfigured', () => {
    const wrapper = makeWrapper({})

    expect(renderHook(() => useProfitAndLossTrendChartConfig(), { wrapper }).result.current).toEqual({})
    expect(renderHook(() => useProfitAndLossDonutChartConfig(), { wrapper }).result.current).toEqual({})
  })
})
