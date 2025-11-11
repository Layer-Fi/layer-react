import { format, subMonths, subYears } from 'date-fns'
import { type LineItemEncoded } from '@schemas/common/lineItem'
import { DateGroupBy } from '@components/DateSelection/DateGroupByComboBox'

export type ComparisonPeriodParams = { endDate: Date, numberOfPeriods: number } & (
  | { mode: Exclude<DateGroupBy, DateGroupBy.AllTime> }
  | { mode: DateGroupBy.AllTime | null, startDate: Date }
)
export const generateComparisonPeriods = (params: ComparisonPeriodParams) => {
  switch (params.mode) {
    case DateGroupBy.Year:
      return generateComparisonYears(params.endDate, params.numberOfPeriods)
    case DateGroupBy.Month:
      return generateComparisonMonths(params.endDate, params.numberOfPeriods)
    default:
      return generateComparisonDateRange(params.startDate, params.endDate)
  }
}

const generateComparisonMonths = (
  endDate: number | Date,
  numberOfMonths: number,
) => {
  return Array.from({ length: numberOfMonths }, (_, index) => {
    const currentMonth = subMonths(endDate, numberOfMonths - index - 1)
    return { date: currentMonth, label: format(currentMonth, 'MMM yyyy') }
  })
}

const generateComparisonYears = (
  endDate: number | Date,
  numberOfYears: number,
) => {
  return Array.from({ length: numberOfYears }, (_, index) => {
    const currentMonth = subYears(endDate, numberOfYears - index - 1)
    return { date: currentMonth, label: format(currentMonth, 'yyyy') }
  })
}

const generateComparisonDateRange = (
  startDate: Date,
  endDate: Date,
) => {
  const label = `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`

  return [{ date: startDate, endDate, label }]
}

export const getComparisonValue = (
  name: string,
  depth: number,
  cellData: string | number | LineItemEncoded,
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
  lineItem: LineItemEncoded,
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
  lineItems: LineItemEncoded[],
): LineItemEncoded[] => {
  const map = new Map<string, LineItemEncoded>()

  for (const item of lineItems) {
    const key = item.display_name

    // Initialize once per key; normalize children to [] for easier merging later
    const existing =
      map.get(key)
      ?? { ...item, line_items: item.line_items ?? [] }

    let next = existing

    // If this occurrence has children, merge them with any existing children
    if (item.line_items && item.line_items.length > 0) {
      const mergedChildren = mergeComparisonLineItemsAtDepth([
        ...(existing.line_items ?? []),
        ...item.line_items,
      ])
      next = { ...next, line_items: mergedChildren }
    }

    // If this occurrence specifies a value, override it
    if (item.value !== undefined) {
      next = { ...next, value: item.value }
    }

    // Write the updated object back into the map
    map.set(key, next)
  }

  return Array.from(map.values())
}
