import { useTaxDetails } from '@hooks/taxEstimates/useTaxDetails'
import { useTaxSummary } from '@hooks/taxEstimates/useTaxSummary'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { ResponsiveComponent } from '@ui/ResponsiveComponent/ResponsiveComponent'

import './taxDetails.scss'

import { type TaxDetailsContentProps, TaxDetailsDesktop } from './TaxDetailsDesktop'
import { TaxDetailsMobile } from './TaxDetailsMobile'

export const TaxDetails = () => {
  const { year } = useTaxEstimatesYear()
  const { data, isLoading, isError } = useTaxDetails({ year })
  const { data: summaryData, isLoading: isSummaryLoading } = useTaxSummary({ year })
  const { isMobile } = useSizeClass()

  const contentProps: TaxDetailsContentProps = {
    summaryData,
    isSummaryLoading,
    data,
    isLoading,
    isError,
  }

  return (
    <ResponsiveComponent
      slots={{
        Desktop: <TaxDetailsDesktop {...contentProps} />,
        Mobile: <TaxDetailsMobile {...contentProps} />,
      }}
      resolveVariant={() => (isMobile ? 'Mobile' : 'Desktop')}
    />
  )
}
