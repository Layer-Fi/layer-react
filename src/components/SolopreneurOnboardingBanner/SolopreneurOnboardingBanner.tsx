import { useCallback, useContext, useMemo } from 'react'
import { Info } from 'lucide-react'

import { useTaxProfile } from '@hooks/api/businesses/[business-id]/tax-estimates/profile/useTaxProfile'
import { useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { LinkedAccountsProvider } from '@providers/LinkedAccountsProvider/LinkedAccountsProvider'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { Banner } from '@ui/Banner/Banner'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'

import './solopreneurOnboardingBanner.scss'

enum OnboardingBannerState {
  Loading = 'Loading',
  NoBankAccountsLinked = 'NoBankAccountsLinked',
  NoTaxProfile = 'NoTaxProfile',
  Onboarded = 'Onboarded',
}

const NoBankAccountsLinkedBanner = () => {
  const { addConnection } = useContext(LinkedAccountsContext)
  const { isMobile } = useSizeClass()
  const onLinkBankAccounts = useCallback(() => {
    void addConnection('PLAID')
  }, [addConnection])

  const Icon = isMobile ? null : <Info size={16} />

  return (
    <Banner
      title='Link your bank accounts'
      description='Linking your bank accounts allows us to load your bank transactions, automatically categorize them, and provide you with tax estimates.'
      slots={{
        Icon,
        Button: <Button onPress={onLinkBankAccounts} variant='outlined-light'>Link your bank accounts</Button>,
      }}
    />
  )
}

const NoTaxProfileBanner = ({ onSetupTaxProfile }: SolopreneurOnboardingBannerProps) => {
  const { isMobile } = useSizeClass()
  const Icon = isMobile ? null : <Info size={16} />
  return (
    <Banner
      title='Setup your tax profile'
      description='Configuring your tax profile allows us to provide you with tax estimates and avoid any surprises come tax time.'
      slots={{
        Icon,
        Button: <Button onPress={onSetupTaxProfile} variant='outlined-light'>Setup your tax profile</Button>,
      }}
    />
  )
}

export type SolopreneurOnboardingBannerProps = {
  onSetupTaxProfile: () => void
}

export function SolopreneurOnboardingBanner({ onSetupTaxProfile }: SolopreneurOnboardingBannerProps) {
  const { state } = useSolopreneurOnboardingBanner()

  return (
    <LinkedAccountsProvider>
      <HStack className='Layer__SolopreneurLayout__OnboardingBanner'>
        {state === OnboardingBannerState.NoBankAccountsLinked && <NoBankAccountsLinkedBanner />}
        {state === OnboardingBannerState.NoTaxProfile && <NoTaxProfileBanner onSetupTaxProfile={onSetupTaxProfile} />}
      </HStack>
    </LinkedAccountsProvider>
  )
}

const useSolopreneurOnboardingBanner = () => {
  const { data: linkedAccounts, isLoading: isLinkedAccountsLoading, loadingStatus: linkedAccountsLoadingStatus } = useLinkedAccounts()
  const { data: taxProfile, isLoading: isTaxProfileLoading } = useTaxProfile()

  const state = useMemo(() => {
    if (isLinkedAccountsLoading || isTaxProfileLoading || linkedAccountsLoadingStatus === 'loading' || linkedAccountsLoadingStatus === 'initial') {
      return OnboardingBannerState.Loading
    }
    if (linkedAccounts && Array.isArray(linkedAccounts) && linkedAccounts?.length === 0) {
      return OnboardingBannerState.NoBankAccountsLinked
    }
    if (!taxProfile?.userHasSavedTaxProfile) {
      return OnboardingBannerState.NoTaxProfile
    }
    if (linkedAccounts?.length && linkedAccounts.length > 0 && taxProfile?.userHasSavedTaxProfile) {
      return OnboardingBannerState.Onboarded
    }
    return OnboardingBannerState.Loading
  }, [linkedAccounts, taxProfile, isLinkedAccountsLoading, isTaxProfileLoading, linkedAccountsLoadingStatus])

  return {
    state,
  }
}
