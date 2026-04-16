import { useCallback, useMemo, useState } from 'react'

import {
  type SortDirection,
} from '@internal-types/general'
import { type ReportingBasis } from '@internal-types/general'
import { SortOrder, type SortParams } from '@internal-types/utility/pagination'
import {
  applyShare,
  collectExpensesItems,
  collectRevenueItems,
  type PnlChartLineItem,
} from '@utils/profitAndLossUtils'
import { useProfitAndLossReport } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss/useProfitAndLossReport'
import {
  type DateSelectionMode,
  useGlobalDateRange,
} from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import type { BreadcrumbItem } from '@components/DetailReportBreadcrumb/DetailReportBreadcrumb'

export type Scope = 'expenses' | 'revenue'

export type SidebarScope = Scope | undefined

export type SelectedLineItem = {
  lineItemName: string
  breadcrumbPath: BreadcrumbItem[]
}

export type PnlTagFilter = {
  key: string
  values: string[]
}

export type SortParamsByScope = Record<
  Scope,
  SortParams<string> | undefined
>

const createPnlLineItemComparator = (filters: SortParams<string> | undefined) => {
  return (a: PnlChartLineItem, b: PnlChartLineItem) => {
    switch (filters?.sortBy) {
      case 'category':
        if (filters?.sortOrder === SortOrder.ASC || filters?.sortOrder === SortOrder.ASCENDING) {
          return a.displayName.localeCompare(b.displayName)
        }
        return b.displayName.localeCompare(a.displayName)

      case 'type':
        if (filters?.sortOrder === SortOrder.ASC || filters?.sortOrder === SortOrder.ASCENDING) {
          return a.type.localeCompare(b.type)
        }
        return b.type.localeCompare(a.type)

      default:
        if (filters?.sortOrder === SortOrder.ASC || filters?.sortOrder === SortOrder.ASCENDING) {
          return a.value - b.value
        }
        return b.value - a.value
    }
  }
}

const sortPnlLineItemsAndCalculateTotal = (
  items: PnlChartLineItem[],
  filter: SortParams<string> | undefined,
) => {
  const sorted = [...items].sort(createPnlLineItemComparator(filter))
  const total = sorted.reduce((x, { value }) => x + value, 0)
  const withShare = applyShare(sorted, total)

  return { items: withShare, total }
}

type UseProfitAndLossOptions = {
  tagFilter?: PnlTagFilter
  reportingBasis?: ReportingBasis
}

export const useProfitAndLoss = ({ tagFilter, reportingBasis }: UseProfitAndLossOptions) => {
  const [dateSelectionMode, setDateSelectionMode] = useState<DateSelectionMode>('month')
  const dateRange = useGlobalDateRange({ dateSelectionMode })

  const [filters, setFilters] = useState<SortParamsByScope>({
    expenses: undefined,
    revenue: undefined,
  })

  const [sidebarScope, setSidebarScope] = useState<SidebarScope>(undefined)
  const [selectedLineItem, setSelectedLineItem] = useState<SelectedLineItem | null>(null)

  const { data, isLoading, isValidating, isError, mutate } =
    useProfitAndLossReport({
      ...dateRange,
      tagKey: tagFilter?.key,
      tagValues: tagFilter?.values?.join(','),
      reportingBasis,
      includeUncategorized: true,
    })

  const sortBy = (scope: Scope, field: string, direction?: SortDirection) => {
    setFilters((prev) => {
      const prevSortOrder = prev[scope]?.sortOrder
      const nextSortOrder = direction
        ? (direction === 'asc' ? SortOrder.ASC : SortOrder.DESC)
        : (prevSortOrder === SortOrder.ASC || prevSortOrder === SortOrder.ASCENDING
          ? SortOrder.DESC
          : SortOrder.ASC)

      return {
        ...prev,
        [scope]: {
          ...prev[scope],
          sortBy: field,
          sortOrder: nextSortOrder,
        },
      }
    })
  }

  const { chartDataRevenue, tableDataRevenue, totalRevenue } = useMemo(() => {
    if (!data) {
      return {
        chartDataRevenue: [],
        tableDataRevenue: [],
        totalRevenue: undefined,
      }
    }

    const items = collectRevenueItems(data)
    const total = items.reduce((sum, { value }) => sum + value, 0)
    const chartItemsWithShare = applyShare(items, total)
    const { items: sortedItemsWithShare } = sortPnlLineItemsAndCalculateTotal(items, filters['revenue'])

    return {
      chartDataRevenue: chartItemsWithShare,
      tableDataRevenue: sortedItemsWithShare,
      totalRevenue: total,
    }
  }, [data, filters])

  const { chartDataExpenses, tableDataExpenses, totalExpenses } = useMemo(() => {
    if (!data) {
      return {
        chartDataExpenses: [],
        tableDataExpenses: [],
        totalExpenses: undefined,
      }
    }
    const items = collectExpensesItems(data)
    const total = items.reduce((sum, { value }) => sum + value, 0)
    const chartItemsWithShare = applyShare(items, total)
    const { items: sortedItemsWithShare } = sortPnlLineItemsAndCalculateTotal(items, filters['expenses'])

    return {
      chartDataExpenses: chartItemsWithShare,
      tableDataExpenses: sortedItemsWithShare,
      totalExpenses: total,
    }
  }, [data, filters])

  const refetch = useCallback(() => {
    void mutate()
  }, [mutate])

  return {
    data,
    chartDataRevenue,
    tableDataRevenue,
    totalRevenue,
    chartDataExpenses,
    tableDataExpenses,
    totalExpenses,
    isLoading,
    isValidating,
    isError,
    refetch,
    sidebarScope,
    setSidebarScope,
    sortBy,
    filters,
    tagFilter,
    dateRange,
    selectedLineItem,
    setSelectedLineItem,
    setDateSelectionMode,
    dateSelectionMode,
  }
}
