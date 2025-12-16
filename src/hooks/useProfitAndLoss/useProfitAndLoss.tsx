import { useCallback, useMemo, useState } from 'react'

import {
  type SortDirection,
} from '@internal-types/general'
import { type ReportingBasis } from '@internal-types/general'
import {
  applyShare,
  collectExpensesItems,
  collectRevenueItems,
  type PnlChartLineItem,
} from '@utils/profitAndLossUtils'
import { useProfitAndLossReport } from '@hooks/useProfitAndLoss/useProfitAndLossReport'
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

type ProfitAndLossFilter = {
  sortBy?: string
  sortDirection?: SortDirection
}

export type ProfitAndLossFilters = Record<
  Scope,
  ProfitAndLossFilter | undefined
>

const createPnlLineItemComparator = (filters: ProfitAndLossFilter | undefined) => {
  return (a: PnlChartLineItem, b: PnlChartLineItem) => {
    switch (filters?.sortBy) {
      case 'category':
        if (filters?.sortDirection === 'asc') {
          return a.displayName.localeCompare(b.displayName)
        }
        return b.displayName.localeCompare(a.displayName)

      case 'type':
        if (filters?.sortDirection === 'asc') {
          return a.type.localeCompare(b.type)
        }
        return b.type.localeCompare(a.type)

      default:
        if (filters?.sortDirection === 'asc') {
          return a.value - b.value
        }
        return b.value - a.value
    }
  }
}

const sortPnlLineItemsAndCalculateTotal = (
  items: PnlChartLineItem[],
  filter: ProfitAndLossFilter | undefined,
) => {
  const sorted = items.sort(createPnlLineItemComparator(filter))
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

  const [filters, setFilters] = useState<ProfitAndLossFilters>({
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
    setFilters({
      ...filters,
      [scope]: {
        ...filters[scope],
        sortBy: field,
        sortDirection:
          (direction ?? filters[scope]?.sortDirection === 'desc')
            ? 'asc'
            : 'desc',
      },
    })
  }

  const { filteredDataRevenue, filteredTotalRevenue } = useMemo(() => {
    if (!data) {
      return { filteredDataRevenue: [], filteredTotalRevenue: undefined }
    }

    const items = collectRevenueItems(data)
    const { items: withShare, total } = sortPnlLineItemsAndCalculateTotal(items, filters['revenue'])

    return { filteredDataRevenue: withShare, filteredTotalRevenue: total }
  }, [data, filters])

  const { filteredDataExpenses, filteredTotalExpenses } = useMemo(() => {
    if (!data) {
      return { filteredDataExpenses: [], filteredTotalExpenses: undefined }
    }

    const items = collectExpensesItems(data)
    const { items: withShare, total } = sortPnlLineItemsAndCalculateTotal(items, filters['expenses'])

    return { filteredDataExpenses: withShare, filteredTotalExpenses: total }
  }, [data, filters])

  const refetch = useCallback(() => {
    void mutate()
  }, [mutate])

  return {
    data,
    filteredDataRevenue,
    filteredTotalRevenue,
    filteredDataExpenses,
    filteredTotalExpenses,
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
