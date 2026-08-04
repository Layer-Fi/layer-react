import { type PlaidHostedLinkConfig } from '@schemas/linkedAccounts/plaid'
import { LinkedAccountsProvider } from '@providers/linkedAccounts/LinkedAccounts/LinkedAccountsProvider'
import { HStack } from '@ui/Stack/Stack'
import { PlaidHostedLinkErrorBanner } from '@features/linkedAccounts/PlaidHostedLinkErrorBanner/PlaidHostedLinkErrorBanner'
import { NoBankAccountsLinkedBanner } from '@views/SolopreneurOverview/SolopreneurOnboardingBanner/NoBankAccountsLinkedBanner'
import { NoTaxProfileBanner } from '@views/SolopreneurOverview/SolopreneurOnboardingBanner/NoTaxProfileBanner'
import { OnboardingBannerState, useSolopreneurOnboardingBannerState } from '@views/SolopreneurOverview/SolopreneurOnboardingBanner/useSolopreneurOnboardingBannerState'

import './solopreneurOnboardingBanner.scss'

export type SolopreneurOnboardingBannerProps = {
  onSetupTaxProfile?: () => void
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
}

function SolopreneurOnboardingBannerInternal({ onSetupTaxProfile }: Pick<SolopreneurOnboardingBannerProps, 'onSetupTaxProfile'>) {
  const state = useSolopreneurOnboardingBannerState()

  if (state === OnboardingBannerState.Loading || state === OnboardingBannerState.Onboarded) {
    return null
  }

  return (
    <HStack className='Layer__SolopreneurLayout__OnboardingBanner'>
      {state === OnboardingBannerState.HostedLinkError && <PlaidHostedLinkErrorBanner showRetryButton />}
      {state === OnboardingBannerState.NoBankAccountsLinked && <NoBankAccountsLinkedBanner />}
      {state === OnboardingBannerState.NoTaxProfile && <NoTaxProfileBanner onSetupTaxProfile={onSetupTaxProfile} />}
    </HStack>
  )
}

export function SolopreneurOnboardingBanner({ onSetupTaxProfile, plaidHostedLinkConfig }: SolopreneurOnboardingBannerProps) {
  return (
    <LinkedAccountsProvider plaidHostedLinkConfig={plaidHostedLinkConfig}>
      <SolopreneurOnboardingBannerInternal onSetupTaxProfile={onSetupTaxProfile} />
    </LinkedAccountsProvider>
  )
}
