import { useEffect, useMemo, useState } from 'react'
import {
  useDateContext,
  useGlobalDateContext,
} from '../../contexts/DateContext'
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
import { useProfitAndLossLTM } from './useProfitAndLossLTM'
import { useProfitAndLossQuery } from './useProfitAndLossQuery'
import { startOfMonth, endOfMonth } from 'date-fns'

export type Scope = 'expenses' | 'revenue'

export type SidebarScope = Scope | undefined

export type PnlTagFilter = {
  key: string
  values: string[]
}

type Props = {
  startDate?: Date
  endDate?: Date
  tagFilter?: PnlTagFilter
  reportingBasis?: ReportingBasis
  dateSyncedWithGlobal?: boolean
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
  tagFilter?: PnlTagFilter
}

export const useProfitAndLoss: UseProfitAndLoss = (
  {
    // startDate: initialStartDate,
    // endDate: initialEndDate,
    tagFilter,
    reportingBasis,
    dateSyncedWithGlobal,
  }: Props = {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  },
) => {
  const { date: globalDateRange, setDate: setGlobalDateRange } =
    useGlobalDateContext()

  const { date: dateRange, setDate: setDateRange } = useDateContext()

  // const [startDate, setStartDate] = useState(
  //   initialStartDate || startOfMonth(Date.now()),
  // )
  // const [endDate, setEndDate] = useState(
  //   initialEndDate || endOfMonth(Date.now()),
  // )
  const [filters, setFilters] = useState<ProfitAndLossFilters>({
    expenses: undefined,
    revenue: undefined,
  })

  useEffect(() => {
    if (
      dateSyncedWithGlobal &&
      JSON.stringify(globalDateRange) !== JSON.stringify(dateRange)
    ) {
      setDateRange(globalDateRange) // @TODO - somewhere here we have to translate
      // setStartDate(globalDateRange.startDate)
      // setEndDate(globalDateRange.endDate)
    }
  }, [globalDateRange])

  // useEffect(() => {
  //   // @TODO period is wrong
  //   // if (
  //   //   dateSyncedWithGlobal &&
  //   //   JSON.stringify(globalDateRange) !==
  //   //     JSON.stringify({ startDate, endDate, period: globalDateRange.period })
  //   // ) {
  //   //   setGlobalDateRange({ startDate, endDate })
  //   // }
  //   if (dateSyncedWithGlobal) {
  //     setGlobalDateRange(dateRange)
  //   }
  // }, [dateRange])

  const [sidebarScope, setSidebarScope] = useState<SidebarScope>(undefined)

  const { data, isLoading, isValidating, error, refetch } =
    useProfitAndLossQuery({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      tagFilter,
      reportingBasis,
    })

  const { data: summaryData } = useProfitAndLossLTM({
    currentDate: dateRange.startDate
      ? dateRange.startDate
      : startOfMonth(new Date()),
    tagFilter: tagFilter,
  })

  const changeDateRange = ({
    startDate: newStartDate,
    endDate: newEndDate,
  }: Partial<DateRange>) => {
    const newDateRange = {
      startDate: newStartDate,
      endDate: newEndDate,
      period: dateRange.period,
    }
    setDateRange(newDateRange)

    // if (dateSyncedWithGlobal) {
    //   setGlobalDateRange(newDateRange)
    // }
  }

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

    const month = dateRange.startDate?.getMonth() ?? 0 + 1
    const year = dateRange.startDate?.getFullYear()
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
  }, [data, dateRange.startDate, filters, sidebarScope, summaryData])

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

    const month = dateRange.startDate?.getMonth() ?? 0 + 1
    const year = dateRange.startDate?.getFullYear()
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
  }, [data, dateRange.startDate, filters, sidebarScope, summaryData])

  return {
    data,
    filteredDataRevenue,
    filteredTotalRevenue,
    filteredDataExpenses,
    filteredTotalExpenses,
    isLoading,
    isValidating,
    error: error,
    dateRange: dateRange,
    refetch,
    changeDateRange,
    sidebarScope,
    setSidebarScope,
    sortBy,
    filters,
    setFilterTypes,
    tagFilter,
  }
}
