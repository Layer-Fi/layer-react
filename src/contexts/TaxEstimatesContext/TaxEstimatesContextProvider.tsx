import { createContext, type PropsWithChildren, useContext, useMemo } from 'react'

export type TaxEstimatesReviewTransactionsPayload = {
  uncategorizedAmount: number
  uncategorizedTransactionCount: number
}

type TaxEstimatesContextValue = {
  onClickReviewTransactions?: (payload: TaxEstimatesReviewTransactionsPayload) => void
}

export type TaxEstimatesContextProviderProps = PropsWithChildren<{
  onClickReviewTransactions?: (payload: TaxEstimatesReviewTransactionsPayload) => void
}>

const TaxEstimatesContext = createContext<TaxEstimatesContextValue>({})

export const useTaxEstimatesContext = () => useContext(TaxEstimatesContext)

export const TaxEstimatesContextProvider = ({ onClickReviewTransactions, children }: TaxEstimatesContextProviderProps) => {
  const value = useMemo<TaxEstimatesContextValue>(
    () => ({ onClickReviewTransactions }),
    [onClickReviewTransactions],
  )
  return (
    <TaxEstimatesContext.Provider value={value}>
      {children}
    </TaxEstimatesContext.Provider>
  )
}
