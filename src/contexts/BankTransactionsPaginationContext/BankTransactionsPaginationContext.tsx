import { createContext, useContext } from 'react'

import { type TablePaginationProps } from '@internal-types/utility/pagination'

export type BankTransactionsPaginationContextType = TablePaginationProps

export const BankTransactionsPaginationContext =
  createContext<BankTransactionsPaginationContextType>({})

export const useBankTransactionsPaginationContext = () =>
  useContext(BankTransactionsPaginationContext)
