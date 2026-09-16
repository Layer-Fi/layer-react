import { useTranslation } from 'react-i18next'

import { useWindowSize } from '@hooks/utils/size/useWindowSize'
import { useGetTaxSummary } from '@api/businesses/[business-id]/tax-estimates/summary/get'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/features/taxEstimates/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { Loader } from '@ui/Loader/Loader'
import { TaxSummaryCardDesktop } from '@features/taxEstimates/TaxSummaryCard/TaxSummaryCardDesktop'
import { TaxSummaryCardMobile } from '@features/taxEstimates/TaxSummaryCard/TaxSummaryCardMobile'

import './taxSummaryCard.scss'

const TAX_SUMMARY_CARD_DESKTOP_BREAKPOINT = 1200

export const TaxSummaryCard = () => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { data, isLoading, isError } = useGetTaxSummary({ year, fullYearProjection })
  const [viewportWidth] = useWindowSize()
  const isDesktop = viewportWidth >= TAX_SUMMARY_CARD_DESKTOP_BREAKPOINT

  return (
    <ConditionalBlock
      isLoading={isLoading}
      isError={isError}
      data={data}
      Loading={<Loader />}
      Error={(
        <DataState
          status={DataStateStatus.failed}
          title={t('taxEstimates:TaxSummaryCard.error.load_tax_estimates_summary', 'We couldn’t load your tax summary')}
          description={t('taxEstimates:TaxSummaryCard.error.while_loading_tax_summary', 'An error occurred while loading your tax summary. Please check your connection and try again.')}
          spacing
        />
      )}
    >
      {({ data: summary }) => isDesktop
        ? <TaxSummaryCardDesktop data={summary} />
        : <TaxSummaryCardMobile data={summary} />}
    </ConditionalBlock>
  )
}
