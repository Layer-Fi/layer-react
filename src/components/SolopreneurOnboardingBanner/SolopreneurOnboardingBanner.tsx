import { useCallback, useContext } from 'react'
import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useTaxProfile } from '@hooks/api/businesses/[business-id]/tax-estimates/profile/useTaxProfile'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { LinkedAccountsProvider } from '@providers/LinkedAccountsProvider/LinkedAccountsProvider'
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

const NoBankAccountsLinkedBanner = () => {
  const { addConnection } = useContext(LinkedAccountsContext)
  const { isMobile } = useSizeClass()
  const { t } = useTranslation()
  const handleLinkBankAccounts = useCallback(() => {
    void addConnection('PLAID')
  }, [addConnection])
  const Icon = isMobile ? null : <Info size={16} />
  const title = t('linkedAccounts:label.link_your_bank_accounts', 'Link your bank accounts')
  const description = t('linkedAccounts:label.link_your_bank_accounts_description', 'Linking your bank accounts allows us to load your bank transactions and automatically categorize them.')
  const Button = <LayerButton onPress={handleLinkBankAccounts} variant='outlined-light'>{title}</LayerButton>
  return <Banner title={title} description={description} slots={{ Icon, Button }} />
}

const NoTaxProfileBanner = ({ onSetupTaxProfile }: Pick<SolopreneurOnboardingBannerProps, 'onSetupTaxProfile'>) => {
  const { isMobile } = useSizeClass()
  const { t } = useTranslation()
  const Icon = isMobile ? null : <Info size={16} />
  const title = t('taxEstimates:label.set_up_your_tax_profile', 'Set up your tax profile')
  const description = t('taxEstimates:label.set_up_your_tax_profile_description', 'Configuring your tax profile allows us to provide you with tax estimates and avoid any surprises come tax time.')
  const Button = onSetupTaxProfile ? <LayerButton onPress={onSetupTaxProfile} variant='outlined-light'>{title}</LayerButton> : null
  return <Banner title={title} description={description} slots={{ Icon, Button }} />
}

function SolopreneurOnboardingBannerInternal({ onSetupTaxProfile }: Pick<SolopreneurOnboardingBannerProps, 'onSetupTaxProfile'>) {
  const state = useSolopreneurOnboardingBannerState()
  if (state === OnboardingBannerState.Loading || state === OnboardingBannerState.Onboarded) {
    return null
  }
  return (
    <HStack className='Layer__SolopreneurLayout__OnboardingBanner'>
      {state === OnboardingBannerState.NoBankAccountsLinked && <NoBankAccountsLinkedBanner />}
      {state === OnboardingBannerState.NoTaxProfile && <NoTaxProfileBanner onSetupTaxProfile={onSetupTaxProfile} />}
    </HStack>
  )
}
export type SolopreneurOnboardingBannerProps = {
  onSetupTaxProfile?: () => void
}

export function SolopreneurOnboardingBanner({ onSetupTaxProfile }: SolopreneurOnboardingBannerProps) {
  return (
    <LinkedAccountsProvider>
      <SolopreneurOnboardingBannerInternal onSetupTaxProfile={onSetupTaxProfile} />
    </LinkedAccountsProvider>
  )
}

const useSolopreneurOnboardingBannerState = () => {
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

  return getOnboardingBannerState({ isLoading, hasLinkedAccounts, hasSavedTaxProfile })
}
