import { useTranslation } from 'react-i18next'

import type { Awaitable } from '@internal-types/utility/promises'
import { type PlaidHostedLinkConfig } from '@schemas/linkedAccounts/plaid'
import { getAccountsNeedingConfirmation } from '@utils/bankAccount'
import { LinkedAccountsProvider } from '@providers/LinkedAccountsProvider/LinkedAccountsProvider'
import { useBankAccountsContext } from '@contexts/BankAccountsContext/BankAccountsContext'
import { Heading } from '@ui/Typography/Heading'
import { LinkAccountsConfirmationStep } from '@components/LinkAccounts/LinkAccountsConfirmationStep'
import { LinkAccountsLinkStep } from '@components/LinkAccounts/LinkAccountsLinkStep'
import { HostedLinkErrorBanner } from '@components/LinkedAccounts/HostedLinkErrorBanner'
import { Wizard } from '@components/Wizard/Wizard'

import './linkAccounts.scss'

type LinkAccountsProps = {
  onComplete?: () => Awaitable<void>
  onPlaidConnectionSuccess?: () => Awaitable<void>
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
  isReconnectFlow?: boolean
}

export function LinkAccounts({ plaidHostedLinkConfig, onPlaidConnectionSuccess, ...props }: LinkAccountsProps) {
  return (
    <LinkedAccountsProvider
      plaidHostedLinkConfig={plaidHostedLinkConfig}
      onPlaidConnectionSuccess={onPlaidConnectionSuccess}
    >
      <LinkAccountsContent {...props} />
    </LinkedAccountsProvider>
  )
}

function LinkAccountsContent({
  onComplete,
  isReconnectFlow = false,
}: Omit<LinkAccountsProps, 'onPlaidConnectionSuccess' | 'plaidHostedLinkConfig'>) {
  const { t } = useTranslation()
  const { data: linkedAccounts, loadingStatus } = useBankAccountsContext()

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
              {isReconnectFlow
                ? t('linkedAccounts:label.reconnect_bank_accounts_and_credit_cards', 'Reconnect your bank accounts and credit cards')
                : t('linkedAccounts:label.link_bank_accounts_and_credit_cards', 'Link your bank accounts and credit cards')}
            </Heading>
            <HostedLinkErrorBanner />
          </>
        )}
        Footer={null}
        onComplete={onComplete}
      >
        <LinkAccountsLinkStep isReconnectFlow={isReconnectFlow} />
        {hideConfirmationStep ? null : <LinkAccountsConfirmationStep />}
      </Wizard>
    </section>
  )
}
