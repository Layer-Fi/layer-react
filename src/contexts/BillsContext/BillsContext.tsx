import { createContext } from 'react'
import { useBills } from '../../hooks/useBills'

export type BillsContextType = ReturnType<typeof useBills>
export const BillsContext = createContext<BillsContextType>({
  data: [],
  billDetailsId: undefined,
  selectedEntryId: undefined,
  setSelectedEntryId: () => {},
  closeSelectedEntry: () => {},
  setBillDetailsId: () => {},
  closeBillDetails: () => {},
})
