import { useMemo } from 'react'

import { useTaxProfile } from '@hooks/api/businesses/[business-id]/tax-estimates/profile/useTaxProfile'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export enum OnboardingStatus {
  Loading = 'Loading',
  Error = 'Error',
  NotOnboarded = 'NotOnboarded',
  Onboarded = 'Onboarded',
  FeatureDisabled = 'FeatureDisabled',
}

export function useTaxEstimatesOnboardingStatus() {
  const { accountingConfiguration } = useLayerContext()
  const { data: taxProfile, isLoading, isError } = useTaxProfile()

  const isFeatureEnabled = useMemo(() => {
    return accountingConfiguration && accountingConfiguration.enableTaxEstimates
  }, [accountingConfiguration])

  if (isLoading || !accountingConfiguration) {
    return OnboardingStatus.Loading
  }

  if (isError) {
    return OnboardingStatus.Error
  }

  if (taxProfile && !taxProfile.userHasSavedTaxProfile) {
    return OnboardingStatus.NotOnboarded
  }

  if (taxProfile && taxProfile.userHasSavedTaxProfile) {
    return OnboardingStatus.Onboarded
  }

  if (!isFeatureEnabled) {
    return OnboardingStatus.FeatureDisabled
  }

  return OnboardingStatus.Onboarded
}
