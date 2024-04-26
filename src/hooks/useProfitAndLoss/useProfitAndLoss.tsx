import { useMemo, useState } from 'react'
import {
  ProfitAndLoss,
  DateRange,
  ReportingBasis,
  SortDirection,
} from '../../types'
import { LineBaseItem } from '../../types/line_item'
import {
  collectExpensesItems,
  collectRevenueItems,
  applyShare,
} from '../../utils/profitAndLossUtils'
import { useLayerContext } from '../useLayerContext'
import { fetchProfitAndLossData } from './fetchProfitAndLossData'
import { startOfMonth, endOfMonth, formatISO } from 'date-fns'

export type Scope = 'expenses' | 'revenue'

export type SidebarScope = Scope | undefined

type Props = {
  startDate?: Date
  endDate?: Date
  tagFilter?: {
    key: string
    values: string[]
  }
  reportingBasis?: ReportingBasis
  fetchMultipleMonths?: boolean
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

type UseProfitAndLoss = (props?: Props) => {
  data: ProfitAndLoss | undefined
  filteredDataRevenue: LineBaseItem[]
  filteredTotalRevenue?: number
  filteredDataExpenses: LineBaseItem[]
  filteredTotalExpenses?: number
  isLoading: boolean
  isValidating: boolean
  error: unknown
  dateRange: DateRange
  changeDateRange: (dateRange: Partial<DateRange>) => void
  refetch: () => void
  sidebarScope: SidebarScope
  setSidebarScope: (view: SidebarScope) => void
  filters: ProfitAndLossFilters
  sortBy: (scope: Scope, field: string, direction?: SortDirection) => void
  setFilterTypes: (scope: Scope, types: string[]) => void
}

export const useProfitAndLoss: UseProfitAndLoss = (
  {
    startDate: initialStartDate,
    endDate: initialEndDate,
    tagFilter,
    reportingBasis,
    fetchMultipleMonths = false,
  }: Props = {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  },
) => {
  const [startDate, setStartDate] = useState(
    initialStartDate || startOfMonth(Date.now()),
  )
  const [endDate, setEndDate] = useState(
    initialEndDate || endOfMonth(Date.now()),
  )
  const [filters, setFilters] = useState<ProfitAndLossFilters>({
    expenses: undefined,
    revenue: undefined,
  })

  const { businessId, auth, apiUrl } = useLayerContext()

  const [sidebarScope, setSidebarScope] = useState<SidebarScope>(undefined)

  const { data, isLoading, isValidating, error, mutate } =
    fetchProfitAndLossData({
      startDate,
      endDate,
      tagFilter,
      reportingBasis,
      fetchMultipleMonths,
      businessId,
      auth,
      apiUrl,
    })

  const changeDateRange = ({
    startDate: newStartDate,
    endDate: newEndDate,
  }: Partial<DateRange>) => {
    newStartDate && setStartDate(newStartDate)
    newEndDate && setEndDate(newEndDate)
  }

  const sortBy = (scope: Scope, field: string, direction?: SortDirection) => {
    setFilters({
      ...filters,
      [scope]: {
        ...filters[scope],
        sortBy: field,
        sortDirection:
          direction ?? filters[scope]?.sortDirection === 'desc'
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
    const filtered = items.map(x => {
      if (
        filters['revenue']?.types &&
        filters['revenue']!.types!.length > 0 &&
        !filters['revenue']?.types?.includes(x.type)
      ) {
        return {
          ...x,
          hidden: true,
        }
      }

      return x
    })

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
  }, [data, startDate, filters, sidebarScope])

  const { filteredDataExpenses, filteredTotalExpenses } = useMemo(() => {
    if (!data) {
      return { filteredDataExpenses: [], filteredTotalExpenses: undefined }
    }
    const items = collectExpensesItems(data)
    const filtered = items.map(x => {
      if (
        filters['expenses']?.types &&
        filters['expenses']!.types!.length > 0 &&
        !filters['expenses']?.types?.includes(x.type)
      ) {
        return {
          ...x,
          hidden: true,
        }
      }

      return x
    })
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
  }, [data, startDate, filters, sidebarScope])

  const refetch = () => {
    mutate()
  }

  return {
    data,
    filteredDataRevenue,
    filteredTotalRevenue,
    filteredDataExpenses,
    filteredTotalExpenses,
    isLoading,
    isValidating,
    error: error,
    dateRange: { startDate, endDate },
    refetch,
    changeDateRange,
    sidebarScope,
    setSidebarScope,
    sortBy,
    filters,
    setFilterTypes,
  }
}
