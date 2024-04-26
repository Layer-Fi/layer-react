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
  data: ProfitAndLoss | ProfitAndLoss[] | undefined
  filteredData: LineBaseItem[]
  filteredTotal?: number
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

  const { filteredData, filteredTotal } = useMemo(() => {
    if (!data || data.length === 0) {
      return { filteredData: [], filteredTotal: undefined }
    }
    const items =
      sidebarScope === 'revenue'
        ? collectRevenueItems(data[0])
        : collectExpensesItems(data[0])
    const filtered = items.map(x => {
      if (
        sidebarScope &&
        filters[sidebarScope]?.types &&
        filters[sidebarScope]!.types!.length > 0 &&
        !filters[sidebarScope]?.types?.includes(x.type)
      ) {
        return {
          ...x,
          hidden: true,
        }
      }

      return x
    })

    const sorted = filtered.sort((a, b) => {
      switch (filters[sidebarScope ?? 'expenses']?.sortBy) {
        case 'category':
          if (filters[sidebarScope ?? 'expenses']?.sortDirection === 'asc') {
            return a.display_name.localeCompare(b.display_name)
          }
          return b.display_name.localeCompare(a.display_name)

        case 'type':
          if (filters[sidebarScope ?? 'expenses']?.sortDirection === 'asc') {
            return a.type.localeCompare(b.type)
          }
          return b.type.localeCompare(a.type)

        default:
          if (filters[sidebarScope ?? 'expenses']?.sortDirection === 'asc') {
            return a.value - b.value
          }
          return b.value - a.value
      }
    })
    const total = sorted
      .filter(x => !x.hidden)
      .reduce((x, { value }) => x + value, 0)
    const withShare = applyShare(sorted, total)

    return { filteredData: withShare, filteredTotal: total }
  }, [data, startDate, filters, sidebarScope])

  const refetch = () => {
    mutate()
  }

  return {
    data: fetchMultipleMonths ? data : data?.[0],
    filteredData,
    filteredTotal,
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
