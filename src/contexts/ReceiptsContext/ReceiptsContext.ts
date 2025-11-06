import { createContext, useContext } from 'react'
import { useReceipts } from '@hooks/useReceipts/useReceipts'

export type ReceiptsContextType = ReturnType<typeof useReceipts>
export const ReceiptsContext = createContext<ReceiptsContextType>({
  receiptUrls: [],
  uploadReceipt: () => Promise.resolve(),
  archiveDocument: () => Promise.resolve(),
})

export const useReceiptsContext = () => useContext(ReceiptsContext)
