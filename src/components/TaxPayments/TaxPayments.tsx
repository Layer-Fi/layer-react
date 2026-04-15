import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useTaxPayments } from '@hooks/api/businesses/[business-id]/tax-estimates/payments/useTaxPayments'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { ResponsiveDetailView } from '@components/ResponsiveDetailView/ResponsiveDetailView'
import { TaxEstimatesHeader } from '@components/TaxEstimates/TaxEstimatesHeader'

import { TaxPaymentsMobileList } from './TaxPaymentsMobileList/TaxPaymentsMobileList'
import { TaxPaymentsTable } from './TaxPaymentsTable/TaxPaymentsTable'

const TaxPaymentsHeader = ({ isMobile }: { isMobile: boolean }) => {
  const { t } = useTranslation()
  return (
    <TaxEstimatesHeader
      title={t('taxEstimates:label.tax_payments', 'Tax Payments')}
      description={t('taxEstimates:label.federal_state_tax_payments', 'Federal and state tax payments for the selected tax year')}
      isMobile={isMobile}
    />
  )
}

const ErrorState = () => {
  const { t } = useTranslation()
  return (
    <DataState
      spacing
      status={DataStateStatus.failed}
      title={t('taxEstimates:error.load_tax_payments', 'We couldnʼt load your tax payments')}
      description={t('taxEstimates:error.while_loading_tax_payments', 'An error occurred while loading your tax payments. Please check your connection and try again.')}
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
      title={t('taxEstimates:empty.tax_payments', 'No tax payments found')}
      description={t('taxEstimates:empty.no_tax_payments_to_display', 'There are no tax payments to display.')}
      className='Layer__TaxPayments__EmptyState'
    />
  )
}

export const TaxPayments = () => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { data, isLoading, isError } = useTaxPayments({ year, fullYearProjection })
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

  const Header = useCallback(() => (
    <TaxPaymentsHeader isMobile={!isDesktop} />
  ), [isDesktop])

  return (
    <ResponsiveDetailView name='TaxPayments' slots={{ Header }}>
      {isDesktop ? <TaxPaymentsTable {...props} /> : <TaxPaymentsMobileList {...props} />}
    </ResponsiveDetailView>
  )
}
