import { useCallback, useContext } from 'react'
import { Info } from 'lucide-react'

import { useTaxProfile } from '@hooks/api/businesses/[business-id]/tax-estimates/profile/useTaxProfile'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { Banner } from '@ui/Banner/Banner'
import { Button as LayerButton } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'

import './solopreneurOnboardingBanner.scss'

enum OnboardingBannerState {
  Loading = 'Loading',
  NoBankAccountsLinked = 'NoBankAccountsLinked',
  NoTaxProfile = 'NoTaxProfile',
  Onboarded = 'Onboarded',
}

const getOnboardingBannerState = ({
  isLoading,
  hasLinkedAccounts,
  hasSavedTaxProfile,
}: {
  isLoading: boolean
  hasLinkedAccounts: boolean
  hasSavedTaxProfile: boolean
}) => {
  if (isLoading) {
    return OnboardingBannerState.Loading
  }

  if (!hasLinkedAccounts) {
    return OnboardingBannerState.NoBankAccountsLinked
  }

  if (!hasSavedTaxProfile) {
    return OnboardingBannerState.NoTaxProfile
  }

  return OnboardingBannerState.Onboarded
}

type NoBankAccountsLinkedBannerProps = {
  onLinkBankAccounts?: () => void
}
const NoBankAccountsLinkedBanner = ({ onLinkBankAccounts }: Pick<NoBankAccountsLinkedBannerProps, 'onLinkBankAccounts'>) => {
  const { addConnection } = useContext(LinkedAccountsContext)
  const { isMobile } = useSizeClass()
  const handleLinkBankAccounts = useCallback(() => {
    if (onLinkBankAccounts === undefined) {
      void addConnection('PLAID')
    }
    else if (onLinkBankAccounts !== null) {
      onLinkBankAccounts()
    }
  }, [addConnection, onLinkBankAccounts])

  const Icon = isMobile ? null : <Info size={16} />
  const Button = onLinkBankAccounts !== null ? <LayerButton onPress={handleLinkBankAccounts} variant='outlined-light'>Link your bank accounts</LayerButton> : null

  return (
    <Banner
      title='Link your bank accounts'
      description='Linking your bank accounts allows us to load your bank transactions and automatically categorize them.'
      slots={{ Icon, Button }}
    />
  )
}

const NoTaxProfileBanner = ({ onSetupTaxProfile }: Pick<SolopreneurOnboardingBannerProps, 'onSetupTaxProfile'>) => {
  const { isMobile } = useSizeClass()
  const Icon = isMobile ? null : <Info size={16} />
  const Button = onSetupTaxProfile ? <LayerButton onPress={onSetupTaxProfile} variant='outlined-light'>Setup your tax profile</LayerButton> : null
  return (
    <Banner
      title='Set up your tax profile'
      description='Configuring your tax profile allows us to provide you with tax estimates and avoid any surprises come tax time.'
      slots={{ Icon, Button }}
    />
  )
}

export type SolopreneurOnboardingBannerProps = {
  onSetupTaxProfile?: () => void
  onLinkBankAccounts?: () => void
}

export function SolopreneurOnboardingBanner({ onSetupTaxProfile, onLinkBankAccounts }: SolopreneurOnboardingBannerProps) {
  const { state } = useSolopreneurOnboardingBanner()
  return (
    <HStack className='Layer__SolopreneurLayout__OnboardingBanner'>
      {state === OnboardingBannerState.NoBankAccountsLinked && <NoBankAccountsLinkedBanner onLinkBankAccounts={onLinkBankAccounts} />}
      {state === OnboardingBannerState.NoTaxProfile && <NoTaxProfileBanner onSetupTaxProfile={onSetupTaxProfile} />}
    </HStack>
  )
}

const useSolopreneurOnboardingBanner = () => {
  const { data: linkedAccounts, isLoading: isLinkedAccountsLoading, loadingStatus: linkedAccountsLoadingStatus } = useContext(LinkedAccountsContext)
  const { data: taxProfile, isLoading: isTaxProfileLoading } = useTaxProfile()

  const isLoading =
  isLinkedAccountsLoading
  || isTaxProfileLoading
  || linkedAccountsLoadingStatus === 'loading'
  || linkedAccountsLoadingStatus === 'initial'

  const hasLinkedAccounts =
Array.isArray(linkedAccounts) && linkedAccounts.length > 0

  const hasSavedTaxProfile = taxProfile?.userHasSavedTaxProfile === true

  const state = getOnboardingBannerState({ isLoading, hasLinkedAccounts, hasSavedTaxProfile })

  return {
    state,
  }
}
