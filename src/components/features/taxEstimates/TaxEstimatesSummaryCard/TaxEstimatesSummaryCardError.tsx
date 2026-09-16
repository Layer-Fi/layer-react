import { useTranslation } from 'react-i18next'

import { DataState, DataStateStatus } from '@ui/DataState/DataState'

export const TaxEstimatesSummaryCardError = () => {
  const { t } = useTranslation()
  return (
    <DataState
      className='Layer__TaxEstimatesSummaryCard__DataState'
      reset
      status={DataStateStatus.failed}
      title={t('taxEstimates:TaxEstimatesSummaryCard.TaxEstimatesSummaryCardError.error.load_tax_estimates_summary', 'We couldn’t load your tax summary')}
      description={t('taxEstimates:TaxEstimatesSummaryCard.TaxEstimatesSummaryCardError.error.while_loading_tax_estimates_summary', 'An error occurred while loading your tax summary. Please check your connection and try again.')}
    />
  )
}
