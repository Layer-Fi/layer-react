import { useContext } from 'react'
import { LinkedAccountsProvider } from '../../providers/LinkedAccountsProvider'
import { LinkAccountsConfirmationStep } from './Steps/LinkAccountsConfirmationStep'
import { LinkAccountsLinkStep } from './Steps/LinkAccountsLinkStep'
import { Wizard } from '../Wizard/Wizard'
import { Heading } from '../ui/Typography/Heading'
import { getAccountsNeedingConfirmation } from '../../hooks/useLinkedAccounts/useLinkedAccounts'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import type { Awaitable } from '../../types/utility/promises'

type LinkAccountsProps = {
  onComplete?: () => Awaitable<void>
  onBack?: () => void
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
  onBack,
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
        <LinkAccountsLinkStep onBack={onBack} />
        {hideConfirmationStep ? null : <LinkAccountsConfirmationStep />}
      </Wizard>
    </section>
  )
}
