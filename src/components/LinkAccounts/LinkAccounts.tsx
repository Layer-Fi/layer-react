import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import type { Awaitable } from '@internal-types/utility/promises'
import { type PlaidHostedLinkConfig } from '@schemas/linkedAccounts/plaid'
import { getAccountsNeedingConfirmation } from '@utils/bankAccount'
import { LinkedAccountsProvider } from '@providers/LinkedAccountsProvider/LinkedAccountsProvider'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { Heading } from '@ui/Typography/Heading'
import { HostedLinkErrorBanner } from '@components/LinkedAccounts/HostedLinkErrorBanner'
import { LinkAccountsConfirmationStep } from '@components/LinkAccounts/LinkAccountsConfirmationStep'
import { LinkAccountsLinkStep } from '@components/LinkAccounts/LinkAccountsLinkStep'
import { Wizard } from '@components/Wizard/Wizard'

import './linkAccounts.scss'

type LinkAccountsProps = {
  onComplete?: () => Awaitable<void>
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
}

export function LinkAccounts({ plaidHostedLinkConfig, ...props }: LinkAccountsProps) {
  return (
    <LinkedAccountsProvider plaidHostedLinkConfig={plaidHostedLinkConfig}>
      <LinkAccountsContent {...props} />
    </LinkedAccountsProvider>
  )
}

function LinkAccountsContent({
  onComplete,
}: LinkAccountsProps) {
  const { t } = useTranslation()
  const { data: linkedAccounts, loadingStatus } = useContext(LinkedAccountsContext)

  const linkedAccountsNeedingConfirmation = linkedAccounts
    ? getAccountsNeedingConfirmation(linkedAccounts)
    : []

  const hideConfirmationStep = loadingStatus === 'complete' && linkedAccountsNeedingConfirmation.length === 0

  return (
    <section className='Layer__link-accounts Layer__component'>
      <Wizard
        Header={(
          <>
            <Heading>
              {t('linkedAccounts:label.link_bank_accounts_and_credit_cards', 'Link your bank accounts and credit cards')}
            </Heading>
            <HostedLinkErrorBanner />
          </>
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
