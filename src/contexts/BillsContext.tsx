import React, { createContext, ReactNode, useContext } from 'react'
import { useBills } from '../hooks/useBills'
import { useBillsRecordPayment } from '../hooks/useBillsRecordPayment'

type BillsProviderProps = {
  children: ReactNode
}

export type BillsContextType = ReturnType<typeof useBills>
export const BillsContext = createContext<BillsContextType>({
  data: [],
  billDetailsId: undefined,
  setBillDetailsId: () => {},
  closeBillDetails: () => {},
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
  showRecordPaymentForm: false,
  setShowRecordPaymentForm: () => {},
  bulkSelectionActive: false,
  setBulkSelectionActive: () => {},
})

export const useBillsContext = () => useContext(BillsContext)
export const useBillsRecordPaymentContext = () => useContext(BillsRecordPaymentContext)

export const BillsProvider: React.FC<BillsProviderProps> = ({ children }) => {
  const bills = useBills()
  const billsRecordPayment = useBillsRecordPayment()

  return (
    <BillsContext.Provider value={bills}>
      <BillsRecordPaymentContext.Provider value={billsRecordPayment}>
        {children}
      </BillsRecordPaymentContext.Provider>
    </BillsContext.Provider>
  )
}
