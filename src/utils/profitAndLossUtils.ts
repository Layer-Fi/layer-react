import { SidebarScope } from '../hooks/useProfitAndLoss/useProfitAndLoss'
import { LineItem, LineBaseItem } from '../types/line_item'
import { ProfitAndLoss } from '../types/profit_and_loss'

const doesLineItemQualifies = (item: LineItem) => {
  return !(
    item.is_contra ||
    item.value === undefined ||
    item.value === null ||
    isNaN(item.value) ||
    item.value === -Infinity ||
    item.value === Infinity ||
    item.value < 0
  )
}

const collectSubItems = (type: string, item?: LineItem | null) => {
  if (!item) {
    return []
  }

  const items: LineBaseItem[] = []

  item?.line_items?.forEach(item => {
    if (doesLineItemQualifies(item)) {
      items.push({
        name: item.name,
        display_name: item.display_name,
        value: item.value || 0,
        type,
      })
    }
  })

  return items
}

export const collectExpensesItems = (data: ProfitAndLoss) => {
  const cogs = collectSubItems('Cost of Goods Sold', data.cost_of_goods_sold)
  const expenses = collectSubItems('Operating Expenses', data.expenses)
  const taxes = collectSubItems('Taxes & Licenses', data.taxes)

  return ([] as LineBaseItem[]).concat(cogs).concat(expenses).concat(taxes)
}

export const collectRevenueItems = (data: ProfitAndLoss) => {
  const income = collectSubItems('Income', data.income)

  return ([] as LineBaseItem[]).concat(income)
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
  items: LineBaseItem[],
  total: number,
  exclude?: string[],
): LineBaseItem[] => {
  return items.map(item => {
    if (total === 0) {
      return item
    }

    if (exclude && exclude.includes(item.type)) {
      return {
        ...item,
        share: undefined,
      }
    }

    return {
      ...item,
      share: item.value / total,
    }
  })
}
