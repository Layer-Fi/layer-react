import { type ReactNode } from 'react'
import { createContext, useContext } from 'react'
import { endOfMonth, startOfMonth } from 'date-fns'
import type React from 'react'

import { useBills } from '@hooks/useBills'
import { useBillsRecordPayment } from '@components/Bills/useBillsRecordPayment'

type BillsProviderProps = {
  children: ReactNode
}

export type BillsContextType = ReturnType<typeof useBills>
export const BillsContext = createContext<BillsContextType>({
  data: [],
  paginatedData: [],
  currentPage: 1,
  setCurrentPage: () => {},
  pageSize: 15,
  billInDetails: undefined,
  openBillDetails: () => {},
  showBillInDetails: false,
  closeBillDetails: () => {},
  status: 'UNPAID',
  setStatus: () => {},
  dateRange: { startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) },
  setDateRange: () => {},
  vendor: null,
  setVendor: () => {},
  fetchMore: () => {},
  hasMore: false,
  isLoading: false,
  isValidating: false,
  error: undefined,
  refetch: () => {},
})

export type BillsRecordPaymentContextType = ReturnType<typeof useBillsRecordPayment>
export const BillsRecordPaymentContext = createContext<BillsRecordPaymentContextType>({
  billsToPay: [],
  setBill: () => {},
  addBill: () => {},
  removeBill: () => {},
  removeBillByIndex: () => {},
  setAmount: () => {},
  setAmountByIndex: () => {},
  vendor: undefined,
  setVendor: () => {},
  paymentDate: new Date(),
  setPaymentDate: () => {},
  paymentMethod: 'ACH',
  setPaymentMethod: () => {},
  showRecordPaymentForm: false,
  setShowRecordPaymentForm: () => {},
  bulkSelectionActive: false,
  openBulkSelection: () => {},
  closeBulkSelection: () => {},
  clearRecordPaymentSelection: () => {},
  recordPayment: () => Promise.resolve(),
  dataSaved: false,
  closeRecordPayment: () => {},
  recordPaymentForBill: () => {},
  payRemainingBalance: () => {},
  isLoading: false,
  apiError: undefined,
})

export const useBillsContext = () => useContext(BillsContext)
export const useBillsRecordPaymentContext = () => useContext(BillsRecordPaymentContext)

export const BillsProvider: React.FC<BillsProviderProps> = ({ children }) => {
  const bills = useBills()

  return (
    <BillsContext.Provider value={bills}>
      <BillContextWithRecordPayment>
        {children}
      </BillContextWithRecordPayment>
    </BillsContext.Provider>
  )
}

const BillContextWithRecordPayment = ({ children }: { children: ReactNode }) => {
  const bills = useBillsContext()
  const billsRecordPayment = useBillsRecordPayment({ refetchAllBills: bills.refetch })

  return (
    <BillsRecordPaymentContext.Provider value={billsRecordPayment}>
      {children}
    </BillsRecordPaymentContext.Provider>
  )
}
