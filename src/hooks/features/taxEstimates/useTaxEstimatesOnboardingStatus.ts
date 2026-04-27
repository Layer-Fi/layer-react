import { type AccountingConfigurationSchemaType } from '@schemas/accountingConfiguration'
import { type TaxProfile } from '@schemas/taxEstimates/profile'
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
  accountingConfiguration: AccountingConfigurationSchemaType | undefined
  taxProfile: TaxProfile | undefined
}

export function getTaxEstimatesOnboardingStatus(input: GetTaxEstimatesOnboardingStatusInput) {
  const isFeatureEnabled = !!input.accountingConfiguration?.enableTaxEstimates
  const hasSavedTaxProfile = input.taxProfile?.userHasSavedTaxProfile
  if (input.isError) {
    return OnboardingStatus.Error
  }

  if (input.isLoading || !input.accountingConfiguration) {
    return OnboardingStatus.Loading
  }

  if (!isFeatureEnabled) {
    return OnboardingStatus.FeatureDisabled
  }

  if (hasSavedTaxProfile === false) {
    return OnboardingStatus.NotOnboarded
  }

  if (hasSavedTaxProfile === true) {
    return OnboardingStatus.Onboarded
  }

  return OnboardingStatus.Loading
}

export function useTaxEstimatesOnboardingStatus() {
  const { accountingConfiguration } = useLayerContext()
  const { data: taxProfile, isLoading, isError } = useTaxProfile()

  return getTaxEstimatesOnboardingStatus({
    isLoading,
    isError,
    accountingConfiguration,
    taxProfile,
  })
}
