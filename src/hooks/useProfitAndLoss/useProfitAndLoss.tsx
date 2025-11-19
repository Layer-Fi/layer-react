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
  type DateRangePickerMode,
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

type UseProfitAndLossOptions = {
  tagFilter?: PnlTagFilter
  reportingBasis?: ReportingBasis
}

type ProfitAndLossFilter = {
  sortBy?: string
  sortDirection?: SortDirection
  types?: string[]
}

export type ProfitAndLossFilters = Record<
  Scope,
  ProfitAndLossFilter | undefined
>

export const useProfitAndLoss = ({ tagFilter, reportingBasis }: UseProfitAndLossOptions) => {
  const [displayMode, setDisplayMode] = useState<DateRangePickerMode>('month')
  const dateRange = useGlobalDateRange({ displayMode })

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

  const setFilterTypes = (scope: Scope, types: string[]) => {
    setFilters({
      ...filters,
      [scope]: {
        ...filters[scope],
        types,
      },
    })
  }

  const { filteredDataRevenue, filteredTotalRevenue } = useMemo(() => {
    if (!data) {
      return { filteredDataRevenue: [], filteredTotalRevenue: undefined }
    }

    const items = collectRevenueItems(data)
    const revenueTypeFilters = filters['revenue']?.types

    const filtered: PnlChartLineItem[] = items.map((x) => {
      if (revenueTypeFilters && revenueTypeFilters.length > 0 && !revenueTypeFilters.includes(x.type)) {
        return { ...x, isHidden: true }
      }

      return x
    })

    const sorted = filtered.sort((a, b) => {
      switch (filters['revenue']?.sortBy) {
        case 'category':
          if (filters['revenue']?.sortDirection === 'asc') {
            return a.displayName.localeCompare(b.displayName)
          }
          return b.displayName.localeCompare(a.displayName)

        case 'type':
          if (filters['revenue']?.sortDirection === 'asc') {
            return a.type.localeCompare(b.type)
          }
          return b.type.localeCompare(a.type)

        default:
          if (filters['revenue']?.sortDirection === 'asc') {
            return a.value - b.value
          }
          return b.value - a.value
      }
    })
    const total = sorted
      .filter(x => !x.isHidden)
      .reduce((x, { value }) => x + value, 0)
    const withShare = applyShare(sorted, total)

    return { filteredDataRevenue: withShare, filteredTotalRevenue: total }
  }, [data, filters])

  const { filteredDataExpenses, filteredTotalExpenses } = useMemo(() => {
    if (!data) {
      return { filteredDataExpenses: [], filteredTotalExpenses: undefined }
    }

    const items = collectExpensesItems(data)
    const expenseTypeFilters = filters['expenses']?.types

    const filtered: PnlChartLineItem[] = items.map((x) => {
      if (expenseTypeFilters && expenseTypeFilters.length > 0 && !expenseTypeFilters.includes(x.type)) {
        return { ...x, isHidden: true }
      }

      return x
    })

    const sorted = filtered.sort((a, b) => {
      switch (filters['expenses']?.sortBy) {
        case 'category':
          if (filters['expenses']?.sortDirection === 'asc') {
            return a.displayName.localeCompare(b.displayName)
          }
          return b.displayName.localeCompare(a.displayName)

        case 'type':
          if (filters['expenses']?.sortDirection === 'asc') {
            return a.type.localeCompare(b.type)
          }
          return b.type.localeCompare(a.type)

        default:
          if (filters['expenses']?.sortDirection === 'asc') {
            return a.value - b.value
          }
          return b.value - a.value
      }
    })
    const total = sorted
      .filter(x => !x.isHidden)
      .reduce((x, { value }) => x + value, 0)
    const withShare = applyShare(sorted, total)

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
    setFilterTypes,
    tagFilter,
    dateRange,
    selectedLineItem,
    setSelectedLineItem,
    setDisplayMode,
    displayMode,
  }
}
