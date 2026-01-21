import { useCallback } from 'react'

import { useTaxProfile } from '@hooks/taxEstimates/useTaxProfile'
import {
  OnboardingStatus,
  TaxEstimatesRoute,
  useTaxEstimatesNavigation,
  useTaxEstimatesOnboardingStatus,
} from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import BackArrow from '@icons/BackArrow'
import { Heading } from '@ui/Typography/Heading'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { TaxProfileForm } from '@components/TaxProfileForm/TaxProfileForm'

export const TaxProfile = () => {
  const onboardingStatus = useTaxEstimatesOnboardingStatus()
  const navigate = useTaxEstimatesNavigation()
  const { data: taxProfile } = useTaxProfile()

  const handleGoBack = useCallback(() => {
    navigate(TaxEstimatesRoute.Estimates)
  }, [navigate])

  const TaxProfileHeader = useCallback(() => {
    return <Heading size='md'>Tax Profile</Heading>
  }, [])

  return (
    <BaseDetailView
      slots={{ Header: TaxProfileHeader, BackIcon: BackArrow }}
      name='TaxProfile'
      onGoBack={onboardingStatus === OnboardingStatus.Onboarded ? handleGoBack : undefined}
    >
      <TaxProfileForm taxProfile={taxProfile} />
    </BaseDetailView>
  )
}
