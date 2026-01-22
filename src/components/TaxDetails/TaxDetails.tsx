import { useTaxDetails } from '@hooks/taxEstimates/useTaxDetails'
import { useTaxSummary } from '@hooks/taxEstimates/useTaxSummary'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'

import './taxDetails.scss'

import { TaxDetailsDesktop } from './TaxDetailsDesktop'
import { TaxDetailsMobile } from './TaxDetailsMobile'

export const TaxDetails = () => {
  const { year } = useTaxEstimatesYear()
  const { data, isLoading, isError } = useTaxDetails({ year })
  const { data: summaryData, isLoading: isSummaryLoading } = useTaxSummary({ year })
  const { isDesktop } = useSizeClass()

  if (isDesktop) {
    return (
      <TaxDetailsDesktop
        summaryData={summaryData}
        isSummaryLoading={isSummaryLoading}
        data={data}
        isLoading={isLoading}
        isError={isError}
      />
    )
  }

  return (
    <TaxDetailsMobile
      summaryData={summaryData}
      isSummaryLoading={isSummaryLoading}
      data={data}
      isLoading={isLoading}
      isError={isError}
    />
  )
}
