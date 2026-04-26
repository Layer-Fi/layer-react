import { createContext } from 'react'
import { endOfMonth, startOfMonth } from 'date-fns'

import { SortOrder } from '@internal-types/utility/pagination'
import { type useProfitAndLoss } from '@hooks/features/profitAndLoss/useProfitAndLoss'

export const ProfitAndLossContext = createContext<ReturnType<typeof useProfitAndLoss>>({
  data: undefined,
  chartDataRevenue: [],
  tableDataRevenue: [],
  totalRevenue: undefined,
  chartDataExpenses: [],
  tableDataExpenses: [],
  totalExpenses: undefined,
  isLoading: true,
  isValidating: false,
  isError: false,
  dateRange: {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  },
  refetch: () => {},
  sidebarScope: undefined,
  setSidebarScope: () => {},
  sortBy: () => {},
  filters: {
    expenses: { sortBy: 'value', sortOrder: SortOrder.DESC },
    revenue: { sortBy: 'value', sortOrder: SortOrder.DESC },
  },
  tagFilter: undefined,
  selectedLineItem: null,
  setSelectedLineItem: () => {},
  setDateSelectionMode: () => {},
  dateSelectionMode: 'month',
})
