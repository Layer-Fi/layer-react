import { DateRangePickerMode } from '../providers/GlobalDateStore/GlobalDateStoreProvider'
import { LineItem } from '../types'
import { format, subMonths, subYears } from 'date-fns'

export const generateComparisonPeriods = (
  startDate: Date, numberOfPeriods: number, rangeDisplayMode: DateRangePickerMode,
) => {
  switch (rangeDisplayMode) {
    case 'yearPicker':
      return generateComparisonYears(startDate, numberOfPeriods)
    default:
      return generateComparisonMonths(startDate, numberOfPeriods)
  }
}

const generateComparisonMonths = (
  startDate: number | Date,
  numberOfMonths: number,
) => {
  return Array.from({ length: numberOfMonths }, (_, index) => {
    const currentMonth = subMonths(startDate, numberOfMonths - index - 1)
    return { date: currentMonth, label: format(currentMonth, 'MMM') }
  })
}

const generateComparisonYears = (
  startDate: number | Date,
  numberOfYears: number,
) => {
  return Array.from({ length: numberOfYears }, (_, index) => {
    const currentMonth = subYears(startDate, numberOfYears - index - 1)
    return { date: currentMonth, label: format(currentMonth, 'yyyy') }
  })
}

export const getComparisonValue = (
  name: string,
  depth: number,
  cellData: string | number | LineItem,
): string | number => {
  if (depth === 0) {
    if (typeof cellData === 'string' || typeof cellData === 'number') {
      return cellData
    }
    else {
      return cellData?.value !== undefined ? cellData.value : ''
    }
  }
  else if (
    typeof cellData === 'object'
    && cellData !== null
    && 'line_items' in cellData
  ) {
    for (const item of cellData.line_items || []) {
      const result = getComparisonLineItemValue(item, name, depth)
      if (result !== '') {
        return result
      }
    }
  }

  return ''
}

const getComparisonLineItemValue = (
  lineItem: LineItem,
  name: string,
  depth: number,
): string | number => {
  if (depth === 1) {
    if (lineItem.display_name === name) {
      return lineItem.value !== undefined ? lineItem.value : ''
    }
  }
  else if (lineItem.line_items && lineItem.line_items.length > 0) {
    for (const childLineItem of lineItem.line_items) {
      const result = getComparisonLineItemValue(childLineItem, name, depth - 1)
      if (result !== '') {
        return result
      }
    }
  }

  return ''
}

export const mergeComparisonLineItemsAtDepth = (
  lineItems: LineItem[],
): LineItem[] => {
  const map = new Map<string, LineItem>()

  const mergeItems = (items: LineItem[]) => {
    items.forEach((item) => {
      if (!map.has(item.display_name)) {
        map.set(item.display_name, { ...item, line_items: [] })
      }

      const existingItem = map.get(item.display_name)!

      if (item.line_items) {
        existingItem.line_items = mergeComparisonLineItemsAtDepth([
          ...(existingItem.line_items || []),
          ...item.line_items,
        ])
      }

      if (item.value !== undefined) {
        existingItem.value = item.value
      }
    })
  }

  mergeItems(lineItems)
  return Array.from(map.values())
}
