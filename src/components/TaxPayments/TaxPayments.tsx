import { useCallback, useMemo } from 'react'

import { useTaxPayments } from '@hooks/taxEstimates/useTaxPayments'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { ResponsiveDetailView } from '@components/ResponsiveDetailView/ResponsiveDetailView'
import { TaxEstimatesHeader } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TaxPaymentsMobileList } from '@components/TaxPayments/TaxPaymentsMobileList/TaxPaymentsMobileList'
import { TaxPaymentsTable } from '@components/TaxPayments/TaxPaymentsTable/TaxPaymentsTable'

const TaxPaymentsHeader = ({ isMobile }: { isMobile: boolean }) => (
  <TaxEstimatesHeader
    title='Tax Payments'
    description='Federal and state tax payments for the selected tax year'
    isMobile={isMobile}
  />
)

const ErrorState = () => (
  <DataState
    spacing
    status={DataStateStatus.failed}
    title='We couldnʼt load your tax payments'
    description='An error occurred while loading your tax payments. Please check your connection and try again.'
    className='Layer__TaxPayments__ErrorState'
  />
)

const EmptyState = () => (
  <DataState
    spacing
    status={DataStateStatus.info}
    title='No tax payments found'
    description='There are no tax payments to display.'
    className='Layer__TaxPayments__EmptyState'
  />
)

export const TaxPayments = () => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { data, isLoading, isError } = useTaxPayments({ year, fullYearProjection })
  const { isDesktop } = useSizeClass()

  const dataWithIds = useMemo(
    () => data?.quarters.map(q => ({ ...q, id: `Q${q.quarter}` })),
    [data?.quarters],
  )

  const props = useMemo(() => ({
    data: dataWithIds,
    isLoading,
    isError,
    slots: {
      EmptyState,
      ErrorState,
    },
  }), [dataWithIds, isError, isLoading])

  const Header = useCallback(() => (
    <TaxPaymentsHeader isMobile={!isDesktop} />
  ), [isDesktop])

  return (
    <ResponsiveDetailView name='TaxPayments' slots={{ Header }}>
      {isDesktop ? <TaxPaymentsTable {...props} /> : <TaxPaymentsMobileList {...props} />}
    </ResponsiveDetailView>
  )
}
