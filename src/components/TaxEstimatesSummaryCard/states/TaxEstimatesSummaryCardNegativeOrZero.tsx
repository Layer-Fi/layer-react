import { useTranslation } from 'react-i18next'

import { DataState, DataStateStatus } from '@components/DataState/DataState'

export const TaxEstimatesSummaryCardNegativeOrZero = () => {
  const { t } = useTranslation()
  return (
    <DataState
      className='Layer__TaxEstimatesSummaryCard__DataState Layer__TaxEstimatesSummaryCard__DataState--negativeOrZero Layer__data-state--reset'
      status={DataStateStatus.info}
      title={t('taxEstimates:error.tax_due_is_negative_or_zero', 'No taxes owed this year')}
      description={t('taxEstimates:error.tax_due_is_negative_or_zero_description', 'Your deductible losses exceed your income for this period, bringing your tax liability to zero. You may be able to carry this loss forward to offset future gains.')}
    />
  )
}
