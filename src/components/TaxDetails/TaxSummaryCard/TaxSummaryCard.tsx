import { useTranslation } from 'react-i18next'

import { useTaxSummary } from '@hooks/api/businesses/[business-id]/tax-estimates/summary/useTaxSummary'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { TaxSummaryCardDesktop } from '@components/TaxDetails/TaxSummaryCard/TaxSummaryCardDesktop'
import { TaxSummaryCardMobile } from '@components/TaxDetails/TaxSummaryCard/TaxSummaryCardMobile'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './taxSummaryCard.scss'

export const TaxSummaryCard = () => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { data, isLoading, isError } = useTaxSummary({ year, fullYearProjection })
  const { isDesktop } = useSizeClass()

  return (
    <ConditionalBlock
      isLoading={isLoading}
      isError={isError}
      data={data}
      Loading={<Loader />}
      Error={(
        <DataState
          status={DataStateStatus.failed}
          title={t('taxEstimates:error.load_tax_estimates_summary', 'We couldn\'t load your tax summary')}
          description={t('taxEstimates:error.while_loading_tax_summary', 'An error occurred while loading your tax summary. Please check your connection and try again.')}
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
