import { useMemo } from 'react'

import { useTaxPayments } from '@hooks/taxEstimates/useTaxPayments'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { ResponsiveDetailHeader } from '@components/ResponsiveDetailView/ResponsiveDetailHeader'
import { ResponsiveDetailView } from '@components/ResponsiveDetailView/ResponsiveDetailView'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { TaxPaymentsMobileList } from '@components/TaxPayments/TaxPaymentsMobileList/TaxPaymentsMobileList'
import { TaxPaymentsTable } from '@components/TaxPayments/TaxPaymentsTable/TaxPaymentsTable'

const TaxPaymentsHeader = () => (
  <ResponsiveDetailHeader
    title='Tax Payments'
    description='Federal and state tax payments for the selected tax year'
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
  const { data, isLoading, isError } = useTaxPayments({ year })
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

  return (
    <ResponsiveDetailView
      name='TaxPayments'
      slots={{ Header: TaxPaymentsHeader }}
    >
      {isDesktop ? <TaxPaymentsTable {...props} /> : <TaxPaymentsMobileList {...props} />}
    </ResponsiveDetailView>
  )
}
