import { useContext } from 'react'

import { useGetAccountingConfiguration } from '@api/businesses/[business-id]/accounting-config/get'
import { useGetTaxProfile } from '@api/businesses/[business-id]/tax-estimates/profile/get'
import { useBankAccountsContext } from '@contexts/BankAccountsContext/BankAccountsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'

export enum OnboardingBannerState {
  Loading = 'Loading',
  HostedLinkError = 'HostedLinkError',
  NoBankAccountsLinked = 'NoBankAccountsLinked',
  NoTaxProfile = 'NoTaxProfile',
  Onboarded = 'Onboarded',
}

const getOnboardingBannerState = ({
  isLoading,
  isHostedLinkError,
  hasLinkedAccounts,
  hasSavedTaxProfile,
  isTaxEstimatesEnabled,
}: {
  isLoading: boolean
  isHostedLinkError: boolean
  hasLinkedAccounts: boolean
  hasSavedTaxProfile: boolean
  isTaxEstimatesEnabled: boolean
}) => {
  if (isHostedLinkError) {
    return OnboardingBannerState.HostedLinkError
  }

  if (isLoading) {
    return OnboardingBannerState.Loading
  }

  if (!hasLinkedAccounts) {
    return OnboardingBannerState.NoBankAccountsLinked
  }

  if (isTaxEstimatesEnabled && !hasSavedTaxProfile) {
    return OnboardingBannerState.NoTaxProfile
  }

  return OnboardingBannerState.Onboarded
}

export const useSolopreneurOnboardingBannerState = () => {
  const { businessId } = useLayerContext()
  const { data: accountingConfiguration, isLoading: isAccountingConfigLoading } = useGetAccountingConfiguration({ businessId })
  const { data: linkedAccounts, loadingStatus: linkedAccountsLoadingStatus } = useBankAccountsContext()
  const { isHostedLinkError } = useContext(LinkedAccountsContext)
  const { data: taxProfile, isLoading: isTaxProfileLoading } = useGetTaxProfile()

  const isTaxEstimatesEnabled = !!accountingConfiguration?.enableTaxEstimates

  const isLoading = isAccountingConfigLoading
    || (isTaxEstimatesEnabled && isTaxProfileLoading)
    || linkedAccountsLoadingStatus === 'loading'
    || linkedAccountsLoadingStatus === 'initial'

  const hasLinkedAccounts = Array.isArray(linkedAccounts) && linkedAccounts.length > 0

  const hasSavedTaxProfile = taxProfile?.userHasSavedTaxProfile === true

  return getOnboardingBannerState({ isLoading, isHostedLinkError, hasLinkedAccounts, hasSavedTaxProfile, isTaxEstimatesEnabled })
}
