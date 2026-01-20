import { useCallback } from 'react'

import {
  TaxEstimatesRoute,
  useTaxEstimatesNavigation,
  useTaxEstimatesOnboardingState,
} from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import BackArrow from '@icons/BackArrow'
import { Heading } from '@ui/Typography/Heading'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'

export const TaxProfile = () => {
  const { isOnboarded } = useTaxEstimatesOnboardingState()
  const navigate = useTaxEstimatesNavigation()

  const handleGoBack = useCallback(() => {
    navigate(TaxEstimatesRoute.Estimates)
  }, [navigate])

  const TaxProfileHeader = useCallback(() => {
    return <Heading size='sm'>{isOnboarded ? 'Update tax profile' : 'Create a tax profile'}</Heading>
  }, [isOnboarded])

  return (
    <BaseDetailView
      slots={{ Header: TaxProfileHeader, BackIcon: BackArrow }}
      name='TaxProfile'
      onGoBack={isOnboarded ? handleGoBack : undefined}
    >
      {/* Form will go here */}
    </BaseDetailView>
  )
}
