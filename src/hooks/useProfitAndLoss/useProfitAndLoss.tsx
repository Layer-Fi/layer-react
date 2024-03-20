import { useMemo, useState } from 'react'
import { Layer } from '../../api/layer'
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
import { startOfMonth, endOfMonth, formatISO } from 'date-fns'
import useSWR from 'swr'

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
}

type ProfitAndLossFilter = {
  sortBy?: string
  sortDirection?: SortDirection
  types?: string[]
}

type ProfitAndLossFilters = Record<Scope, ProfitAndLossFilter | undefined>

type UseProfitAndLoss = (props?: Props) => {
  data: ProfitAndLoss | undefined
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
  }: Props = {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  },
) => {
  const { auth, businessId, apiUrl } = useLayerContext()
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

  // const [sidebarView, setSidebarView] = useState<SidebarView>(undefined)
  const [sidebarScope, setSidebarScope] = useState<SidebarScope>('expenses')

  const {
    data: rawData,
    isLoading,
    isValidating,
    error: rawError,
    mutate,
  } = useSWR(
    businessId &&
      startDate &&
      endDate &&
      auth?.access_token &&
      `profit-and-loss-${businessId}-${startDate.valueOf()}-${endDate.valueOf()}-${tagFilter?.key}-${tagFilter?.values?.join(
        ',',
      )}-${reportingBasis}`,
    Layer.getProfitAndLoss(apiUrl, auth?.access_token, {
      params: {
        businessId,
        startDate: formatISO(startDate),
        endDate: formatISO(endDate),
        tagKey: tagFilter?.key,
        tagValues: tagFilter?.values?.join(','),
        reportingBasis,
      },
    }),
  )
  const { data, error } = rawData || {}

  const { filteredData, filteredTotal } = useMemo(() => {
    if (!data) {
      return { filteredData: [], filteredTotal: undefined }
    }
    const items =
      sidebarScope === 'revenue'
        ? collectRevenueItems(data)
        : collectExpensesItems(data)
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

  const changeDateRange = ({
    startDate: newStartDate,
    endDate: newEndDate,
  }: Partial<DateRange>) => {
    newStartDate && setStartDate(newStartDate)
    newEndDate && setEndDate(newEndDate)
  }

  const refetch = () => {
    mutate()
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

  return {
    data,
    filteredData,
    filteredTotal,
    isLoading,
    isValidating,
    error: error || rawError,
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
