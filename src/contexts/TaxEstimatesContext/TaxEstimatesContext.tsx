import { createContext, type PropsWithChildren, useContext, useMemo } from 'react'

import { type TaxOverviewBannerReview } from '@schemas/taxEstimates/overview'

export type TaxEstimatesContextType = {
  onTaxBannerReviewClick?: (payload: TaxOverviewBannerReview) => void
}

export type TaxEstimatesProviderProps = PropsWithChildren<TaxEstimatesContextType>

const TaxEstimatesContext = createContext<TaxEstimatesContextType>({})

export const useTaxEstimatesContext = () => useContext(TaxEstimatesContext)

export const TaxEstimatesProvider = ({
  onTaxBannerReviewClick,
  children,
}: TaxEstimatesProviderProps) => {
  const value = useMemo(
    () => ({ onTaxBannerReviewClick }),
    [onTaxBannerReviewClick],
  )

  return (
    <TaxEstimatesContext.Provider value={value}>
      {children}
    </TaxEstimatesContext.Provider>
  )
}
