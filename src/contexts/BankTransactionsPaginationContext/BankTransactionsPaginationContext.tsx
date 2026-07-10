import { createContext, useContext } from 'react'

import { type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

export type BankTransactionsPaginationContextType = TablePaginationProps

export const BankTransactionsPaginationContext =
  createContext<BankTransactionsPaginationContextType>({})

export const useBankTransactionsPaginationContext = () =>
  useContext(BankTransactionsPaginationContext)
