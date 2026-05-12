import { useTranslation } from 'react-i18next'

import { DataState, DataStateStatus } from '@components/DataState/DataState'

export function TaxEstimatesSummaryCardEmpty() {
  const { t } = useTranslation()
  return (
    <DataState
      className='Layer__TaxEstimatesSummaryCard__DataState Layer__data-state--reset'
      status={DataStateStatus.info}
      title={t('taxEstimates:empty.no_tax_estimates_summary', 'Get started with your tax estimates')}
      description={t('taxEstimates:empty.no_tax_estimates_summary_description', 'Start by importing and categorizing your bank transactions')}
    />
  )
}
