import { type PropsWithChildren } from 'react'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { type Scope } from '@internal-types/features/profitAndLoss/profitAndLoss'
import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { DEFAULT_CHART_COLORS, UNCATEGORIZED_CHART_COLOR } from '@utils/shared/styles/chartColors'
import {
  ProfitAndLossChartConfigProvider,
  useProfitAndLossChartPalette,
  useProfitAndLossDonutChartConfig,
  useProfitAndLossTrendChartConfig,
} from '@providers/features/profitAndLoss/ProfitAndLossChartConfigContext/ProfitAndLossChartConfigContext'

type Props = { chartConfig?: ProfitAndLossChartConfig, chartColorsList?: string[] }

const makeWrapper = (props: Props) => function Wrapper({ children }: PropsWithChildren) {
  return <ProfitAndLossChartConfigProvider {...props}>{children}</ProfitAndLossChartConfigProvider>
}

const renderPalette = (scope: Scope, props: Props) =>
  renderHook(() => useProfitAndLossChartPalette(scope), { wrapper: makeWrapper(props) }).result.current

describe('useProfitAndLossChartPalette', () => {
  it.each<[string, Props, string[], string[]]>([
    [
      'prefers the scoped list',
      { chartConfig: { colors: { revenue: ['#111'], expenses: ['#222'] } }, chartColorsList: ['#444'] },
      ['#111'], ['#222'],
    ],
    [
      'falls back to the flat list for the omitted scope',
      { chartConfig: { colors: { expenses: ['#222'] } }, chartColorsList: ['#444'] },
      ['#444'], ['#222'],
    ],
    ['applies the flat list to both scopes', { chartColorsList: ['#444'] }, ['#444'], ['#444']],
    ['falls back to the defaults when unset', {}, DEFAULT_CHART_COLORS, DEFAULT_CHART_COLORS],
    [
      'falls back to the defaults when the list is empty',
      { chartConfig: { colors: { revenue: [], expenses: [] } } },
      DEFAULT_CHART_COLORS, DEFAULT_CHART_COLORS,
    ],
  ])('%s', (_, props, revenue, expenses) => {
    expect(renderPalette('revenue', props).palette).toEqual(revenue)
    expect(renderPalette('expenses', props).palette).toEqual(expenses)
  })

  it('distinguishes an overridden uncategorized color from the default', () => {
    const overridden = renderPalette('revenue', { chartConfig: { colors: { uncategorized: '#333' } } })
    expect(overridden).toMatchObject({ uncategorized: '#333', uncategorizedOverride: '#333' })

    const defaulted = renderPalette('revenue', {})
    expect(defaulted).toMatchObject({
      uncategorized: UNCATEGORIZED_CHART_COLOR,
      uncategorizedOverride: undefined,
    })
  })

  it('falls back to the defaults outside a provider', () => {
    const { result } = renderHook(() => useProfitAndLossChartPalette('expenses'))

    expect(result.current.palette).toEqual(DEFAULT_CHART_COLORS)
    expect(result.current.uncategorized).toBe(UNCATEGORIZED_CHART_COLOR)
  })
})

describe('chart section hooks', () => {
  it('expose their section, or an empty object when unconfigured', () => {
    const configured = makeWrapper({
      chartConfig: { trendChart: { barSize: 36 }, donutChart: { innerRadius: '70%' } },
    })
    const empty = makeWrapper({})

    expect(renderHook(useProfitAndLossTrendChartConfig, { wrapper: configured }).result.current)
      .toEqual({ barSize: 36 })
    expect(renderHook(useProfitAndLossDonutChartConfig, { wrapper: configured }).result.current)
      .toEqual({ innerRadius: '70%' })
    expect(renderHook(useProfitAndLossTrendChartConfig, { wrapper: empty }).result.current).toEqual({})
    expect(renderHook(useProfitAndLossDonutChartConfig, { wrapper: empty }).result.current).toEqual({})
  })
})
