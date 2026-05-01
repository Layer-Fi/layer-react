import { ResponsiveDetailView } from '@components/ResponsiveDetailView/ResponsiveDetailView'
import { TaxSummaryCard } from '@components/TaxDetails/TaxSummaryCard/TaxSummaryCard'
import { TaxEstimatesHeader, TaxEstimatesHeaderType } from '@components/TaxEstimates/TaxEstimatesHeader'

import './taxDetails.scss'

import { TaxDetailsContent } from './TaxDetailsContent'

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
