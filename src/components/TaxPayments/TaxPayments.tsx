import { useCallback, useMemo } from 'react'
import { type TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { useTaxPayments } from '@hooks/api/businesses/[business-id]/tax-estimates/payments/useTaxPayments'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { ResponsiveDetailView } from '@components/ResponsiveDetailView/ResponsiveDetailView'
import { TaxEstimatesHeader } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TaxPaymentsMobileList } from '@components/TaxPayments/TaxPaymentsMobileList/TaxPaymentsMobileList'
import { TaxPaymentsTable } from '@components/TaxPayments/TaxPaymentsTable/TaxPaymentsTable'

const TaxPaymentsHeader = ({ isMobile, translation }: { isMobile: boolean, translation: TFunction }) => {
  const t = translation
  return (
    <TaxEstimatesHeader
      title={t('taxEstimates:label.tax_payments', 'Tax Payments')}
      description={t('taxEstimates:label.federal_state_tax_payments', 'Federal and state tax payments for the selected tax year')}
      isMobile={isMobile}
    />
  )
}

const ErrorState = ({ translation }: { translation: TFunction }) => {
  const t = translation
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

const EmptyState = ({ translation }: { translation: TFunction }) => {
  const t = translation
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
  const { t } = useTranslation()
  const props = useMemo(() => ({
    data,
    isLoading,
    isError,
    slots: {
      EmptyState: () => <EmptyState translation={t} />,
      ErrorState: () => <ErrorState translation={t} />,
    },
  }), [data, isError, isLoading, t])

  const Header = useCallback(() => (
    <TaxPaymentsHeader isMobile={!isDesktop} translation={t} />
  ), [isDesktop, t])

  return (
    <ResponsiveDetailView name='TaxPayments' slots={{ Header }}>
      {isDesktop ? <TaxPaymentsTable {...props} /> : <TaxPaymentsMobileList {...props} />}
    </ResponsiveDetailView>
  )
}
