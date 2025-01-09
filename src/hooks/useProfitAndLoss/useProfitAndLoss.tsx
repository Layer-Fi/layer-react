import { useMemo, useState } from 'react'
import {
  DateRange,
  ReportingBasis,
  SortDirection,
} from '../../types'
import {
  collectExpensesItems,
  collectRevenueItems,
  applyShare,
} from '../../utils/profitAndLossUtils'
import { useProfitAndLossLTM } from './useProfitAndLossLTM'
import { useProfitAndLossQuery } from './useProfitAndLossQuery'
import { useGlobalDateRange } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

export type Scope = 'expenses' | 'revenue'

export type SidebarScope = Scope | undefined

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

export const useProfitAndLoss = ({
  tagFilter,
  reportingBasis,
}: UseProfitAndLossOptions) => {
  const { start, end } = useGlobalDateRange()

  const [filters, setFilters] = useState<ProfitAndLossFilters>({
    expenses: undefined,
    revenue: undefined,
  })

  const [sidebarScope, setSidebarScope] = useState<SidebarScope>(undefined)

  const { data, isLoading, isValidating, error, refetch } =
    useProfitAndLossQuery({
      startDate: start,
      endDate: end,
      tagFilter,
      reportingBasis,
    })

  const { data: summaryData } = useProfitAndLossLTM({
    currentDate: start,
    tagFilter: tagFilter,
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
    const filtered = items.map((x) => {
      if (
        filters['revenue']?.types
        && filters['revenue']!.types!.length > 0
        && !filters['revenue']?.types?.includes(x.type)
      ) {
        return {
          ...x,
          hidden: true,
        }
      }

      return x
    })

    const month = start.getMonth() + 1
    const year = start.getFullYear()
    const found = summaryData.find(x => x.month === month && x.year === year)
    if (found && (found.uncategorizedInflows ?? 0) > 0) {
      filtered.push({
        name: 'uncategorized',
        display_name: 'Uncategorized',
        value: found.uncategorizedInflows,
        type: 'Uncategorized',
        share: 0,
        hidden: false,
      })
    }

    const sorted = filtered.sort((a, b) => {
      switch (filters['revenue']?.sortBy) {
        case 'category':
          if (filters['revenue']?.sortDirection === 'asc') {
            return a.display_name.localeCompare(b.display_name)
          }
          return b.display_name.localeCompare(a.display_name)

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
      .filter(x => !x.hidden)
      .reduce((x, { value }) => x + value, 0)
    const withShare = applyShare(sorted, total)

    return { filteredDataRevenue: withShare, filteredTotalRevenue: total }
  }, [data, start, filters, summaryData])

  const { filteredDataExpenses, filteredTotalExpenses } = useMemo(() => {
    if (!data) {
      return { filteredDataExpenses: [], filteredTotalExpenses: undefined }
    }
    const items = collectExpensesItems(data)
    const filtered = items.map((x) => {
      if (
        filters['expenses']?.types
        && filters['expenses']!.types!.length > 0
        && !filters['expenses']?.types?.includes(x.type)
      ) {
        return {
          ...x,
          hidden: true,
        }
      }

      return x
    })

    const month = start.getMonth() + 1
    const year = start.getFullYear()
    const found = summaryData.find(x => x.month === month && x.year === year)
    if (found && (found.uncategorizedOutflows ?? 0) > 0) {
      filtered.push({
        name: 'uncategorized',
        display_name: 'Uncategorized',
        value: found.uncategorizedOutflows,
        type: 'Uncategorized',
        share: 0,
        hidden: false,
      })
    }

    const sorted = filtered.sort((a, b) => {
      switch (filters['expenses']?.sortBy) {
        case 'category':
          if (filters['expenses']?.sortDirection === 'asc') {
            return a.display_name.localeCompare(b.display_name)
          }
          return b.display_name.localeCompare(a.display_name)

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
      .filter(x => !x.hidden)
      .reduce((x, { value }) => x + value, 0)
    const withShare = applyShare(sorted, total)

    return { filteredDataExpenses: withShare, filteredTotalExpenses: total }
  }, [data, start, filters, summaryData])

  return {
    data,
    filteredDataRevenue,
    filteredTotalRevenue,
    filteredDataExpenses,
    filteredTotalExpenses,
    isLoading,
    isValidating,
    error: error,
    dateRange: { startDate: start, endDate: end },
    refetch,
    sidebarScope,
    setSidebarScope,
    sortBy,
    filters,
    setFilterTypes,
    tagFilter,
  }
}
