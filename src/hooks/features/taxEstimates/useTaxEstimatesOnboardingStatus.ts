import { useTaxProfile } from '@hooks/api/businesses/[business-id]/tax-estimates/profile/useTaxProfile'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export enum OnboardingStatus {
  Loading = 'Loading',
  Error = 'Error',
  NotOnboarded = 'NotOnboarded',
  Onboarded = 'Onboarded',
  FeatureDisabled = 'FeatureDisabled',
}

type GetTaxEstimatesOnboardingStatusInput = {
  isLoading: boolean
  isError: boolean
  hasAccountingConfiguration: boolean
  isFeatureEnabled: boolean
  hasSavedTaxProfile: boolean | undefined
}

export function getTaxEstimatesOnboardingStatus(input: GetTaxEstimatesOnboardingStatusInput) {
  if (input.isError) {
    return OnboardingStatus.Error
  }

  if (input.isLoading || !input.hasAccountingConfiguration) {
    return OnboardingStatus.Loading
  }

  if (!input.isFeatureEnabled) {
    return OnboardingStatus.FeatureDisabled
  }

  if (input.hasSavedTaxProfile === false) {
    return OnboardingStatus.NotOnboarded
  }

  if (input.hasSavedTaxProfile === true) {
    return OnboardingStatus.Onboarded
  }

  return OnboardingStatus.Loading
}

export function useTaxEstimatesOnboardingStatus() {
  const { accountingConfiguration } = useLayerContext()
  const { data: taxProfile, isLoading, isError } = useTaxProfile()
  const isFeatureEnabled = !!accountingConfiguration?.enableTaxEstimates

  return getTaxEstimatesOnboardingStatus({
    isLoading,
    isError,
    hasAccountingConfiguration: !!accountingConfiguration,
    isFeatureEnabled,
    hasSavedTaxProfile: taxProfile?.userHasSavedTaxProfile,
  })
}
