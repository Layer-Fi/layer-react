import { createContext } from 'react'
import { endOfMonth, startOfMonth } from 'date-fns'

import { type useProfitAndLoss } from '@hooks/useProfitAndLoss/useProfitAndLoss'

export const ProfitAndLossContext = createContext<ReturnType<typeof useProfitAndLoss>>({
  data: undefined,
  filteredDataRevenue: [],
  filteredTotalRevenue: undefined,
  filteredDataExpenses: [],
  filteredTotalExpenses: undefined,
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
    expenses: undefined,
    revenue: undefined,
  },
  tagFilter: undefined,
  selectedLineItem: null,
  setSelectedLineItem: () => {},
  setDateSelectionMode: () => {},
  dateSelectionMode: 'month',
})
