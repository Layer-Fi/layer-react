import { describe, expect, it } from 'vitest'

import { type Scope } from '@internal-types/features/profitAndLoss/profitAndLoss'
import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { DEFAULT_CHART_COLORS, UNCATEGORIZED_CHART_COLOR } from '@utils/shared/styles/chartColors'
import { resolveProfitAndLossChartPalette } from '@features/profitAndLoss/utils'

type TestCase = {
  chartConfig?: ProfitAndLossChartConfig
  chartColorsList?: string[]
}

const resolvePalette = (scope: Scope, props: TestCase) =>
  resolveProfitAndLossChartPalette(scope, props.chartConfig, props.chartColorsList)

describe('resolveProfitAndLossChartPalette', () => {
  it.each<[string, TestCase, string[], string[]]>([
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
    expect(resolvePalette('revenue', props).palette).toEqual(revenue)
    expect(resolvePalette('expenses', props).palette).toEqual(expenses)
  })

  it('distinguishes an overridden uncategorized color from the default', () => {
    const overridden = resolvePalette('revenue', { chartConfig: { colors: { uncategorized: '#333' } } })
    expect(overridden).toMatchObject({ uncategorized: '#333', uncategorizedOverride: '#333' })

    const defaulted = resolvePalette('revenue', {})
    expect(defaulted).toMatchObject({
      uncategorized: UNCATEGORIZED_CHART_COLOR,
      uncategorizedOverride: undefined,
    })
  })
})
