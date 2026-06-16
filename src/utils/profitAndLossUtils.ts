import type { TFunction } from 'i18next'

import type { LineItem } from '@schemas/common/lineItem'
import type { ProfitAndLoss } from '@schemas/reports/profitAndLoss'
import { type Scope, type SidebarScope } from '@hooks/features/profitAndLoss/useProfitAndLoss'
import { type DetailedChartStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'

export type PnlChartLineItem = LineItem & {
  type: string
  share?: number
}

const collectSubItems = (item: LineItem): PnlChartLineItem[] => {
  return item.lineItems.map(subItem => ({
    ...subItem,
    value: subItem.isContra ? -subItem.value : subItem.value,
    type: item.displayName,
  }))
}

export const collectExpensesItems = (data: ProfitAndLoss): PnlChartLineItem[] => {
  const cogs = collectSubItems(data.costOfGoodsSold)
  const expenses = collectSubItems(data.expenses)
  const taxes = collectSubItems(data.taxes)

  const expensesItems: PnlChartLineItem[] = [...cogs, ...expenses, ...taxes]

  if (data.uncategorizedOutflows) {
    expensesItems.push({
      ...data.uncategorizedOutflows,
      type: data.uncategorizedOutflows.displayName,
    })
  }

  return expensesItems
}

export const collectRevenueItems = (data: ProfitAndLoss): PnlChartLineItem[] => {
  const revenueItems: PnlChartLineItem[] = collectSubItems(data.income)

  if (data.uncategorizedInflows) {
    revenueItems.push({
      ...data.uncategorizedInflows,
      type: data.uncategorizedInflows.displayName,
    })
  }

  return revenueItems
}

const toMiniChartItem = (name: string, value: number): PnlChartLineItem => ({
  name,
  displayName: name,
  value,
  isContra: false,
  type: name,
  lineItems: [],
})

const collectCashflowItems = (scope: Scope, data: ProfitAndLoss): PnlChartLineItem[] => {
  const isRevenue = scope === 'revenue'

  const categorized = isRevenue ? data.income.value : data.income.value - data.netProfit
  const uncategorized = (isRevenue ? data.uncategorizedInflows : data.uncategorizedOutflows)?.value ?? 0

  return [
    toMiniChartItem(scope, categorized),
    toMiniChartItem(isRevenue ? 'UNCATEGORIZED_INFLOWS' : 'UNCATEGORIZED_OUTFLOWS', uncategorized),
  ]
}

export const humanizeTitle = (
  sidebarView: SidebarScope,
  overrides: DetailedChartStringOverrides | undefined,
  t: TFunction,
) => {
  switch (sidebarView) {
    case 'expenses':
      return overrides?.expenseChartHeader || t('common:label.expenses', 'Expenses')
    case 'revenue':
      return overrides?.revenueChartHeader || t('common:label.revenue', 'Revenue')
    default:
      return t('common:label.profit_loss', 'Profit & Loss')
  }
}

export const applyShare = (
  items: PnlChartLineItem[],
  total: number,
): PnlChartLineItem[] => {
  return items.map((item) => {
    if (total === 0) {
      return item
    }

    return {
      ...item,
      share: item.value / total,
    }
  })
}

const CHART_PLACEHOLDER: PnlChartLineItem[] = [{
  name: 'placeholder',
  displayName: 'placeholder',
  isContra: false,
  value: 1,
  type: 'placeholder',
  share: 1,
  lineItems: [],
}]

export function toMiniChartData({
  scope,
  data,
  mode,
}: {
  scope: Scope
  data?: ProfitAndLoss
  mode: 'profitAndLoss' | 'cashflow'
}): PnlChartLineItem[] {
  if (!data) {
    return CHART_PLACEHOLDER
  }

  let items: PnlChartLineItem[]
  if (mode === 'cashflow') {
    items = collectCashflowItems(scope, data)
  }
  else if (scope === 'revenue') {
    items = collectRevenueItems(data)
  }
  else {
    items = collectExpensesItems(data)
  }

  if (items.length === 0 || !items.some(item => Math.abs(item.value) !== 0)) {
    return CHART_PLACEHOLDER
  }

  return items
}
