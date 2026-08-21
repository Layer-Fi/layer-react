import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import type { Awaitable } from '@internal-types/utility/awaitable'
import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { type PlaidHostedLinkConfig } from '@schemas/features/linkedAccounts/plaidHostedLinkConfig'
import { getAccountsNeedingConfirmation } from '@utils/features/bankAccounts/bankAccount'
import { COMPONENT_ROOT_CLASS_NAME } from '@utils/shared/styles/componentClassNames'
import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'
import { LinkedAccountsProvider } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsProvider'
import { Heading } from '@ui/Typography/Heading'
import { Wizard } from '@blocks/Wizard/Wizard'
import { LinkAccountsConfirmationStep } from '@features/linkedAccounts/LinkAccounts/LinkAccountsConfirmationStep'
import {
  LinkAccountsLinkStep,
  type LinkAccountsStringOverrides,
} from '@features/linkedAccounts/LinkAccounts/LinkAccountsLinkStep'
import { PlaidHostedLinkErrorBanner } from '@features/linkedAccounts/PlaidHostedLinkErrorBanner/PlaidHostedLinkErrorBanner'

import './linkAccounts.scss'

export type { LinkAccountsStringOverrides }

type LinkAccountsProps = {
  onComplete?: () => Awaitable<void>
  onPlaidConnectionSuccess?: () => Awaitable<void>
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
  customerManagedPlaidConfig?: CustomerManagedPlaidConfig
  isReconnectFlow?: boolean
  stringOverrides?: LinkAccountsStringOverrides
}

export function LinkAccounts({
  plaidHostedLinkConfig,
  customerManagedPlaidConfig,
  onPlaidConnectionSuccess,
  ...props
}: LinkAccountsProps) {
  return (
    <LinkedAccountsProvider
      plaidHostedLinkConfig={plaidHostedLinkConfig}
      customerManagedPlaidConfig={customerManagedPlaidConfig}
      onPlaidConnectionSuccess={onPlaidConnectionSuccess}
    >
      <LinkAccountsContent {...props} />
    </LinkedAccountsProvider>
  )
}

function LinkAccountsContent({
  onComplete,
  isReconnectFlow = false,
  stringOverrides,
}: Omit<LinkAccountsProps, 'onPlaidConnectionSuccess' | 'plaidHostedLinkConfig' | 'customerManagedPlaidConfig'>) {
  const { t } = useTranslation()
  const { data: linkedAccounts, loadingStatus } = useBankAccountsContext()

  const linkedAccountsNeedingConfirmation = linkedAccounts
    ? getAccountsNeedingConfirmation(linkedAccounts)
    : []

  const hideConfirmationStep = loadingStatus === 'complete' && linkedAccountsNeedingConfirmation.length === 0

  return (
    <section className={classNames('Layer__link-accounts', COMPONENT_ROOT_CLASS_NAME)}>
      <Wizard
        Header={(
          <>
            <Heading>
              {isReconnectFlow
                ? t('linkedAccounts:LinkAccounts.label.reconnect_bank_accounts_and_credit_cards', 'Reconnect your bank accounts and credit cards')
                : t('linkedAccounts:LinkAccounts.label.link_bank_accounts_and_credit_cards', 'Link your bank accounts and credit cards')}
            </Heading>
            <PlaidHostedLinkErrorBanner />
          </>
        )}
        Footer={null}
        onComplete={onComplete}
      >
        <LinkAccountsLinkStep isReconnectFlow={isReconnectFlow} stringOverrides={stringOverrides} />
        {hideConfirmationStep ? null : <LinkAccountsConfirmationStep />}
      </Wizard>
    </section>
  )
}
