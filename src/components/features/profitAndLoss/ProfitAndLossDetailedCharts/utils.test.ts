import { describe, expect, it } from 'vitest'

import type { PnlChartLineItem } from '@utils/features/profitAndLoss/profitAndLoss'
import { DEFAULT_CHART_COLORS, UNCATEGORIZED_CHART_COLOR } from '@utils/shared/styles/chartColors'
import { mapTypesToColors } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/utils'

const buildLineItem = (name: string): PnlChartLineItem => ({
  name,
  displayName: name,
  value: 100,
  isContra: false,
  lineItems: [],
  type: 'Income',
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
