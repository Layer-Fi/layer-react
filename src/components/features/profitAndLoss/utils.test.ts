import { describe, expect, it } from 'vitest'

import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { DEFAULT_CHART_COLORS, UNCATEGORIZED_CHART_COLOR } from '@utils/shared/styles/chartColors'
import {
  resolveProfitAndLossChartPalette,
  resolveProfitAndLossTrendBarWidth,
} from '@features/profitAndLoss/utils'

type PaletteProps = {
  chartConfig?: ProfitAndLossChartConfig
  chartColorsList?: string[]
}

const expectPalettes = (
  props: PaletteProps,
  expected: { revenue: string[], expenses: string[] },
) => {
  expect(resolveProfitAndLossChartPalette('revenue', props.chartConfig, props.chartColorsList).palette)
    .toEqual(expected.revenue)
  expect(resolveProfitAndLossChartPalette('expenses', props.chartConfig, props.chartColorsList).palette)
    .toEqual(expected.expenses)
}

describe('resolveProfitAndLossChartPalette', () => {
  it('prefers the scoped list over the flat list', () => {
    expectPalettes(
      { chartConfig: { colors: { revenue: ['#111'], expenses: ['#222'] } }, chartColorsList: ['#444'] },
      { revenue: ['#111'], expenses: ['#222'] },
    )
  })

  it('falls back to the flat list for the omitted scope', () => {
    expectPalettes(
      { chartConfig: { colors: { expenses: ['#222'] } }, chartColorsList: ['#444'] },
      { revenue: ['#444'], expenses: ['#222'] },
    )
  })

  it('applies the flat list to both scopes', () => {
    expectPalettes({ chartColorsList: ['#444'] }, { revenue: ['#444'], expenses: ['#444'] })
  })

  it('falls back to the defaults when unset', () => {
    expectPalettes({}, { revenue: DEFAULT_CHART_COLORS, expenses: DEFAULT_CHART_COLORS })
  })

  it('falls back to the defaults when the list is empty', () => {
    expectPalettes(
      { chartConfig: { colors: { revenue: [], expenses: [] } } },
      { revenue: DEFAULT_CHART_COLORS, expenses: DEFAULT_CHART_COLORS },
    )
  })

  it('distinguishes an overridden uncategorized color from the default', () => {
    const overridden = resolveProfitAndLossChartPalette('revenue', { colors: { uncategorized: '#333' } })
    expect(overridden).toMatchObject({ uncategorized: '#333', uncategorizedOverride: '#333' })

    const defaulted = resolveProfitAndLossChartPalette('revenue')
    expect(defaulted).toMatchObject({
      uncategorized: UNCATEGORIZED_CHART_COLOR,
      uncategorizedOverride: undefined,
    })
  })
})

const expectBarWidths = (
  chartConfig: ProfitAndLossChartConfig | undefined,
  expected: { full: number, compact: number },
) => {
  expect(resolveProfitAndLossTrendBarWidth({ compactView: false, chartConfig })).toBe(expected.full)
  expect(resolveProfitAndLossTrendBarWidth({ compactView: true, chartConfig })).toBe(expected.compact)
}

describe('resolveProfitAndLossTrendBarWidth', () => {
  it('falls back to the defaults when unset', () => {
    expectBarWidths(undefined, { full: 20, compact: 10 })
  })

  it('halves a configured width for the compact view', () => {
    expectBarWidths({ trendChart: { barWidth: 36 } }, { full: 36, compact: 18 })
  })

  it('prefers an explicit compact width', () => {
    expectBarWidths({ trendChart: { barWidth: 36, compactBarWidth: 30 } }, { full: 36, compact: 30 })
  })

  it('applies a compact width without a full width', () => {
    expectBarWidths({ trendChart: { compactBarWidth: 4 } }, { full: 20, compact: 4 })
  })
})
