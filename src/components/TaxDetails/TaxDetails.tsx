import { ResponsiveDetailView } from '@components/ResponsiveDetailView/ResponsiveDetailView'
import { TaxSummaryCard } from '@components/TaxDetails/TaxSummaryCard/TaxSummaryCard'
import { TaxEstimatesHeader, TaxEstimatesHeaderType } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TAX_DETAIL_MIN_DESKTOP_WIDTH } from '@views/TaxEstimates/breakpoints'

import './taxDetails.scss'

import { TaxDetailsContent } from './TaxDetailsContent'

const TaxDetailsHeader = () => <TaxEstimatesHeader type={TaxEstimatesHeaderType.Estimates} />

export const TaxDetails = () => {
  return (
    <ResponsiveDetailView
      name='TaxDetails'
      className='Layer__TaxDetail'
      minDesktopWidth={TAX_DETAIL_MIN_DESKTOP_WIDTH}
      slots={{ Header: TaxDetailsHeader }}
      mobileProps={{ className: 'Layer__TaxDetails--mobile' }}
    >
      <TaxSummaryCard />
      <TaxDetailsContent />
    </ResponsiveDetailView>
  )
}
