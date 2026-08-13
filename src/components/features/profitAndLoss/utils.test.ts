import { describe, expect, it } from 'vitest'

import { type Scope } from '@internal-types/features/profitAndLoss/profitAndLoss'
import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { DEFAULT_CHART_COLORS, UNCATEGORIZED_CHART_COLOR } from '@utils/shared/styles/chartColors'
import {
  resolveProfitAndLossChartPalette,
  resolveProfitAndLossTrendBarWidth,
} from '@features/profitAndLoss/utils'

const paletteFor = (scope: Scope, chartConfig?: ProfitAndLossChartConfig, chartColorsList?: string[]) =>
  resolveProfitAndLossChartPalette(scope, chartConfig, chartColorsList).palette

describe('resolveProfitAndLossChartPalette', () => {
  it('prefers the scoped list over the flat list', () => {
    const chartConfig = { colors: { revenue: ['#111'], expenses: ['#222'] } }

    expect(paletteFor('revenue', chartConfig, ['#444'])).toEqual(['#111'])
    expect(paletteFor('expenses', chartConfig, ['#444'])).toEqual(['#222'])
  })

  it('falls back to the flat list for the omitted scope', () => {
    const chartConfig = { colors: { expenses: ['#222'] } }

    expect(paletteFor('revenue', chartConfig, ['#444'])).toEqual(['#444'])
    expect(paletteFor('expenses', chartConfig, ['#444'])).toEqual(['#222'])
  })

  it('applies the flat list to both scopes', () => {
    expect(paletteFor('revenue', undefined, ['#444'])).toEqual(['#444'])
    expect(paletteFor('expenses', undefined, ['#444'])).toEqual(['#444'])
  })

  it('falls back to the defaults when unset', () => {
    expect(paletteFor('revenue')).toEqual(DEFAULT_CHART_COLORS)
    expect(paletteFor('expenses')).toEqual(DEFAULT_CHART_COLORS)
  })

  it('falls back to the defaults when the scoped list is empty', () => {
    const chartConfig = { colors: { revenue: [], expenses: [] } }

    expect(paletteFor('revenue', chartConfig)).toEqual(DEFAULT_CHART_COLORS)
    expect(paletteFor('expenses', chartConfig)).toEqual(DEFAULT_CHART_COLORS)
  })

  it('reports an overridden uncategorized color as an override', () => {
    const resolved = resolveProfitAndLossChartPalette('revenue', { colors: { uncategorized: '#333' } })

    expect(resolved.uncategorized).toBe('#333')
    expect(resolved.uncategorizedOverride).toBe('#333')
  })

  it('defaults the uncategorized color without reporting an override', () => {
    const resolved = resolveProfitAndLossChartPalette('revenue')

    expect(resolved.uncategorized).toBe(UNCATEGORIZED_CHART_COLOR)
    expect(resolved.uncategorizedOverride).toBeUndefined()
  })
})

describe('resolveProfitAndLossTrendBarWidth', () => {
  it('falls back to the defaults when unset', () => {
    expect(resolveProfitAndLossTrendBarWidth({ compactView: false })).toBe(20)
    expect(resolveProfitAndLossTrendBarWidth({ compactView: true })).toBe(10)
  })

  it('halves a configured width for the compact view', () => {
    const chartConfig = { trendChart: { barWidth: 36 } }

    expect(resolveProfitAndLossTrendBarWidth({ compactView: false, chartConfig })).toBe(36)
    expect(resolveProfitAndLossTrendBarWidth({ compactView: true, chartConfig })).toBe(18)
  })

  it('prefers an explicit compact width over halving', () => {
    const chartConfig = { trendChart: { barWidth: 36, compactBarWidth: 30 } }

    expect(resolveProfitAndLossTrendBarWidth({ compactView: false, chartConfig })).toBe(36)
    expect(resolveProfitAndLossTrendBarWidth({ compactView: true, chartConfig })).toBe(30)
  })

  it('applies a compact width without a full width', () => {
    const chartConfig = { trendChart: { compactBarWidth: 4 } }

    expect(resolveProfitAndLossTrendBarWidth({ compactView: false, chartConfig })).toBe(20)
    expect(resolveProfitAndLossTrendBarWidth({ compactView: true, chartConfig })).toBe(4)
  })
})
