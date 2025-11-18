import { useContext } from 'react'

import type { Awaitable } from '@internal-types/utility/promises'
import { getAccountsNeedingConfirmation } from '@hooks/useLinkedAccounts/useLinkedAccounts'
import { LinkedAccountsProvider } from '@providers/LinkedAccountsProvider/LinkedAccountsProvider'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { Heading } from '@ui/Typography/Heading'
import { LinkAccountsConfirmationStep } from '@components/PlatformOnboarding/Steps/LinkAccountsConfirmationStep'
import { LinkAccountsLinkStep } from '@components/PlatformOnboarding/Steps/LinkAccountsLinkStep'
import { Wizard } from '@components/Wizard/Wizard'

import './linkAccounts.scss'

type LinkAccountsProps = {
  onComplete?: () => Awaitable<void>
}

export function LinkAccounts(props: LinkAccountsProps) {
  return (
    <LinkedAccountsProvider>
      <LinkAccountsContent {...props} />
    </LinkedAccountsProvider>
  )
}

function LinkAccountsContent({
  onComplete,
}: LinkAccountsProps) {
  const { data: linkedAccounts, loadingStatus } = useContext(LinkedAccountsContext)

  const linkedAccountsNeedingConfirmation = linkedAccounts
    ? getAccountsNeedingConfirmation(linkedAccounts)
    : []

  const hideConfirmationStep = loadingStatus === 'complete' && linkedAccountsNeedingConfirmation.length === 0

  return (
    <section className='Layer__link-accounts Layer__component'>
      <Wizard
        Header={(
          <Heading>
            Link your bank accounts and credit cards
          </Heading>
        )}
        Footer={null}
        onComplete={onComplete}
      >
        <LinkAccountsLinkStep />
        {hideConfirmationStep ? null : <LinkAccountsConfirmationStep />}
      </Wizard>
    </section>
  )
}
