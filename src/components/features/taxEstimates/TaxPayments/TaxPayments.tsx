import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useGetTaxPayments } from '@api/businesses/[business-id]/tax-estimates/payments/get'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/features/taxEstimates/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { ResponsiveDetailView } from '@blocks/Layout/ResponsiveDetailView/ResponsiveDetailView'
import { TaxEstimatesHeader, TaxEstimatesHeaderType } from '@features/taxEstimates/TaxEstimatesHeader/TaxEstimatesHeader'
import { TaxPaymentsMobileList } from '@features/taxEstimates/TaxPaymentsMobileList/TaxPaymentsMobileList'
import { TaxPaymentsTable } from '@features/taxEstimates/TaxPaymentsTable/TaxPaymentsTable'

const ErrorState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      spacing
      status={DataStateStatus.failed}
      title={t('taxEstimates:TaxPayments.error.load_tax_payments', 'We couldn’t load your tax payments')}
      description={t('taxEstimates:TaxPayments.error.while_loading_tax_payments', 'An error occurred while loading your tax payments. Please check your connection and try again.')}
      className='Layer__TaxPayments__ErrorState'
    />
  )
}

const EmptyState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      spacing
      status={DataStateStatus.info}
      title={t('taxEstimates:TaxPayments.empty.tax_payments', 'No tax payments found')}
      description={t('taxEstimates:TaxPayments.empty.no_tax_payments_to_display', 'There are no tax payments to display.')}
      className='Layer__TaxPayments__EmptyState'
    />
  )
}

const Header = () => <TaxEstimatesHeader type={TaxEstimatesHeaderType.Payments} />

export const TaxPayments = () => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { data, isLoading, isError } = useGetTaxPayments({ year, fullYearProjection })
  const { isDesktop } = useSizeClass()
  const props = useMemo(() => ({
    data,
    isLoading,
    isError,
    slots: {
      EmptyState,
      ErrorState,
    },
  }), [data, isError, isLoading])

  return (
    <ResponsiveDetailView className='Layer__TaxPayments' slots={{ Header }}>
      {isDesktop ? <TaxPaymentsTable {...props} /> : <TaxPaymentsMobileList {...props} />}
    </ResponsiveDetailView>
  )
}
