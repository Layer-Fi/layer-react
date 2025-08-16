import type { ProfitAndLoss } from '../hooks/useProfitAndLoss/schemas'
import { SidebarScope } from '../hooks/useProfitAndLoss/useProfitAndLoss'
import type { LineItem } from './schema/utils'

export type PnlChartLineItem = LineItem & {
  type: string
  isHidden?: boolean
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

export const humanizeTitle = (sidebarView: SidebarScope) => {
  switch (sidebarView) {
    case 'expenses':
      return 'Expenses'
    case 'revenue':
      return 'Revenue'
    default:
      return 'Profit & Loss'
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
