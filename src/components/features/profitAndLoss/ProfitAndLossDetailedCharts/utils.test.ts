import { describe, expect, it } from 'vitest'

import type { PnlChartLineItem } from '@utils/features/profitAndLoss/profitAndLoss'
import { DEFAULT_CHART_COLORS } from '@utils/shared/styles/chartColors'
import {
  mapTypesToColors,
  resolveScopedChartColorList,
  resolveUncategorizedColor,
  UNCATEGORIZED_CHART_COLOR,
} from '@features/profitAndLoss/ProfitAndLossDetailedCharts/utils'

const buildLineItem = (name: string): PnlChartLineItem => ({
  name,
  displayName: name,
  value: 100,
  isContra: false,
  lineItems: [],
  type: 'Income',
})

describe('resolveScopedChartColorList', () => {
  const chartColors = { revenue: ['#111111'], expenses: ['#222222'], uncategorized: '#333333' }

  it('picks the revenue list for the revenue scope', () => {
    expect(resolveScopedChartColorList('revenue', chartColors)).toEqual(['#111111'])
  })

  it('picks the expenses list for the expenses scope', () => {
    expect(resolveScopedChartColorList('expenses', chartColors)).toEqual(['#222222'])
  })

  it('falls back to the flat list when the scoped list is absent', () => {
    expect(resolveScopedChartColorList('revenue', { expenses: ['#222222'] }, ['#444444'])).toEqual(['#444444'])
  })

  it('returns the flat list for both scopes when only the flat list is provided', () => {
    const flat = ['#444444', '#555555']

    expect(resolveScopedChartColorList('revenue', undefined, flat)).toEqual(flat)
    expect(resolveScopedChartColorList('expenses', undefined, flat)).toEqual(flat)
  })

  it('returns undefined when nothing is provided', () => {
    expect(resolveScopedChartColorList('revenue')).toBeUndefined()
  })
})

describe('resolveUncategorizedColor', () => {
  it('returns the configured color', () => {
    expect(resolveUncategorizedColor({ uncategorized: '#333333' })).toBe('#333333')
  })

  it('falls back to the default uncategorized color', () => {
    expect(resolveUncategorizedColor()).toBe(UNCATEGORIZED_CHART_COLOR)
    expect(resolveUncategorizedColor({ revenue: ['#111111'] })).toBe(UNCATEGORIZED_CHART_COLOR)
  })
})

describe('mapTypesToColors', () => {
  const data = [buildLineItem('Consulting'), buildLineItem('UNCATEGORIZED_INFLOWS')]

  it('colors uncategorized line items with the provided color', () => {
    const getColor = mapTypesToColors(data, ['#111111'], '#333333')

    expect(getColor('UNCATEGORIZED_INFLOWS').color).toBe('#333333')
    expect(getColor('Consulting').color).toBe('#111111')
  })

  it('defaults the uncategorized color and palette when omitted', () => {
    const getColor = mapTypesToColors(data)

    expect(getColor('UNCATEGORIZED_INFLOWS').color).toBe(UNCATEGORIZED_CHART_COLOR)
    expect(getColor('Consulting').color).toBe(DEFAULT_CHART_COLORS[0])
  })
})
