import { createContext, useContext } from 'react'
import { useReceipts } from '../../hooks/useReceipts'

export type ReceiptsContextType = ReturnType<typeof useReceipts>
export const ReceiptsContext = createContext<ReceiptsContextType>({
  receiptUrls: [],
  uploadReceipt: () => {},
  archiveDocument: () => {},
})

export const useReceiptsContext = () => useContext(ReceiptsContext)
