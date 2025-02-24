import React, { createContext, ReactNode, useContext } from 'react'
import { useBills } from '../hooks/useBills'
import { useBillsRecordPayment } from '../components/Bills/useBillsRecordPayment'
import { endOfMonth, startOfMonth } from 'date-fns'

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
  setBillInDetails: () => {},
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
  recordPayment: () => Promise.resolve(),
  dataSaved: false,
  closeRecordPayment: () => {},
  recordPaymentForBill: () => {},
  payRemainingBalance: () => {},
})

export const useBillsContext = () => useContext(BillsContext)
export const useBillsRecordPaymentContext = () => useContext(BillsRecordPaymentContext)

export const BillsProvider: React.FC<BillsProviderProps> = ({ children }) => {
  const bills = useBills()
  const billsRecordPayment = useBillsRecordPayment({ refetchAllBills: bills.refetch })

  return (
    <BillsContext.Provider value={bills}>
      <BillsRecordPaymentContext.Provider value={billsRecordPayment}>
        {children}
      </BillsRecordPaymentContext.Provider>
    </BillsContext.Provider>
  )
}
