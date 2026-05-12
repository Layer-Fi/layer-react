import { useTranslation } from 'react-i18next'

import { DataState, DataStateStatus } from '@components/DataState/DataState'

export const TaxEstimatesSummaryCardError = () => {
  const { t } = useTranslation()
  return (
    <DataState
      className='Layer__TaxEstimatesSummaryCard__DataState Layer__data-state--reset'
      status={DataStateStatus.failed}
      title={t('taxEstimates:error.load_tax_estimates_summary', 'We couldn\'t load your tax summary')}
      description={t('taxEstimates:error.while_loading_tax_estimates_summary', 'An error occurred while loading your tax summary. Please check your connection and try again.')}
    />
  )
}
