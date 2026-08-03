import { ResponsiveDetailView } from '@blocks/Layout/ResponsiveDetailView/ResponsiveDetailView'
import { TaxDetailsContent } from '@features/taxEstimates/TaxDetails/TaxDetailsContent'
import { TaxEstimatesHeader, TaxEstimatesHeaderType } from '@features/taxEstimates/TaxEstimatesHeader/TaxEstimatesHeader'
import { TaxSummaryCard } from '@features/taxEstimates/TaxSummaryCard/TaxSummaryCard'

import './taxDetails.scss'

const TaxDetailsHeader = () => <TaxEstimatesHeader type={TaxEstimatesHeaderType.Estimates} />

export const TaxDetails = () => {
  return (
    <ResponsiveDetailView
      name='TaxDetails'
      slots={{ Header: TaxDetailsHeader }}
      mobileProps={{ className: 'Layer__TaxDetails--mobile' }}
    >
      <TaxSummaryCard />
      <TaxDetailsContent />
    </ResponsiveDetailView>
  )
}
