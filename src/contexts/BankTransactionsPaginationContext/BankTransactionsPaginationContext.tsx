import { createContext, useContext } from 'react'

import { type TablePaginationProps } from '@hooks/utils/pagination/types'

export type BankTransactionsPaginationContextType = TablePaginationProps

export const BankTransactionsPaginationContext =
  createContext<BankTransactionsPaginationContextType>({})

export const useBankTransactionsPaginationContext = () =>
  useContext(BankTransactionsPaginationContext)
