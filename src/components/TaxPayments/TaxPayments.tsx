import { useMemo } from 'react'

import { BREAKPOINTS } from '@config/general'
import { useTaxPayments } from '@hooks/taxEstimates/useTaxPayments'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { ResponsiveComponent } from '@ui/ResponsiveComponent/ResponsiveComponent'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { TaxPaymentsDesktopView } from '@components/TaxPayments/TaxPaymentsDesktopView'
import { TaxPaymentsMobileView } from '@components/TaxPayments/TaxPaymentsMobileView'

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

const resolveVariant = ({ width }: { width: number }) => {
  if (width <= BREAKPOINTS.MOBILE) {
    return 'Mobile'
  }
  return 'Desktop'
}

export const TaxPayments = () => {
  const { year } = useTaxEstimatesYear()
  const { data, isLoading, isError } = useTaxPayments({ year })

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
    <ResponsiveComponent
      resolveVariant={resolveVariant}
      slots={{ Desktop: <TaxPaymentsDesktopView {...props} />, Mobile: <TaxPaymentsMobileView {...props} /> }}
    />
  )
}
