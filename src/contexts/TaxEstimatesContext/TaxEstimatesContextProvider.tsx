import { createContext, type PropsWithChildren, useContext } from 'react'

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
  return (
    <TaxEstimatesContext.Provider value={{ onClickReviewTransactions }}>
      {children}
    </TaxEstimatesContext.Provider>
  )
}
