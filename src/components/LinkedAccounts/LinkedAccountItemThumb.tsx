import { useContext, useState } from 'react'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext/LinkedAccountsContext'
import { LinkedAccount } from '../../types/linked_accounts'
import { LinkedAccountOptions } from '../LinkedAccountOptions/LinkedAccountOptions'
import { LinkedAccountThumb } from '../LinkedAccountThumb/LinkedAccountThumb'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import type { HoverMenuProps } from '../HoverMenu/HoverMenu'
import { LinkedAccountPill } from '../LinkedAccountPill/LinkedAccountPill'
import { UnlinkAccountConfirmationModal } from './UnlinkAccountConfirmationModal/UnlinkAccountConfirmationModal'

function accountNeedsUniquenessConfirmation({
  notifications,
}: Pick<LinkedAccount, 'notifications'>) {
  return notifications?.some(({ type }) => type === 'CONFIRM_UNIQUE')
}

function accountMissingOpeningBalance({
  notifications,
}: Pick<LinkedAccount, 'notifications'>) {
  return notifications?.some(({ type }) => type === 'OPENING_BALANCE_MISSING')
}

export interface LinkedAccountItemThumbProps {
  account: LinkedAccount
  asWidget?: boolean
  showLedgerBalance?: boolean
  showUnlinkItem?: boolean
  showBreakConnection?: boolean
}

export const LinkedAccountItemThumb = ({
  account,
  asWidget,
  showLedgerBalance,
  showUnlinkItem,
  showBreakConnection,
}: LinkedAccountItemThumbProps) => {
  const {
    addConnection,
    removeConnection,
    repairConnection,
    confirmAccount,
    excludeAccount,
    breakConnection,
    setAccountsToAddOpeningBalanceInModal,
  } = useContext(LinkedAccountsContext)
  const { environment } = useEnvironment()
  const [isUnlinkConfirmationModalOpen, setIsUnlinkConfirmationModalOpen] = useState(false)

  let pillConfig
  if (accountNeedsUniquenessConfirmation(account)) {
    pillConfig = {
      text: 'Confirm account',
      config: [
        {
          name: 'Mark as a duplicate account',
          action: () => {
            // TODO: trigger some sort of loading spinner here
            void excludeAccount(account.external_account_source, account.id)
            // TODO: turn off loading spinner
          },
        },
        {
          name: 'Mark as not a duplicate account',
          action: () => {
            // TODO: trigger some sort of loading spinner here
            void confirmAccount(account.external_account_source, account.id)
            // TODO: turn off loading spinner
          },
        },
      ],
    }
  }
  else if (account.connection_needs_repair_as_of) {
    pillConfig = {
      text: 'Fix account',
      config: [
        {
          name: 'Repair connection',
          action: () => {
            if (account.connection_external_id) {
              // TODO: trigger some sort of loading spinner here
              // An account is "broken" when its connection is broken
              if (account.reconnect_with_new_credentials) {
                void addConnection(
                  account.external_account_source,
                )
              }
              else {
                void repairConnection(
                  account.external_account_source,
                  account.connection_external_id,
                )
              }
              // TODO: turn off loading spinner
            }
          },
        },
      ],
    }
  }

  const additionalConfigs: HoverMenuProps['config'] = []

  const canUnlinkAccount =
    account.external_account_source === 'PLAID'
    || (account.external_account_source === 'CUSTOM' && account.user_created)

  if (canUnlinkAccount) {
    additionalConfigs.push({
      name: account.external_account_source === 'CUSTOM' ? 'Delete account' : 'Unlink account',
      action: () => {
        setIsUnlinkConfirmationModalOpen(true)
      },
    })
  }

  if (showUnlinkItem) {
    additionalConfigs.push({
      name: `Unlink all accounts under this ${account.institution?.name} connection`,
      action: () => {
        // TODO: replace with better confirm dialog
        if (
          account.connection_external_id
          && confirm(
            `Please confirm you wish to remove all accounts belonging to ${
              account.institution?.name || 'this institution'
            }`,
          )
        ) {
          // TODO: trigger some sort of loading spinner here
          void removeConnection(
            account.external_account_source,
            account.connection_external_id,
          )
          // TODO: turn off loading spinner
        }
      },
    })
  }

  if (accountMissingOpeningBalance(account)) {
    additionalConfigs.push({
      name: 'Add opening balance',
      action: () => {
        setAccountsToAddOpeningBalanceInModal([account])
      },
    })
  }

  if (
    environment === 'staging'
    && !account.connection_needs_repair_as_of
    && account.external_account_source === 'PLAID'
    && showBreakConnection
  ) {
    additionalConfigs.push({
      name: 'Break connection (test utility)',
      action: () => {
        if (account.connection_external_id) {
          void breakConnection(
            account.external_account_source,
            account.connection_external_id,
          )
        }
        else {
          console.warn('Account doesn\'t have defined connection_external_id')
        }
      },
    })
  }

  return (
    <LinkedAccountOptions
      config={[...additionalConfigs, ...(pillConfig ? pillConfig.config : [])]}
      showLedgerBalance={showLedgerBalance}
    >
      <LinkedAccountThumb
        account={account}
        asWidget={asWidget}
        showLedgerBalance={showLedgerBalance}
        slots={{
          Pill: pillConfig
            ? <LinkedAccountPill label={pillConfig.text} items={pillConfig.config} />
            : null,
        }}
      />
      {isUnlinkConfirmationModalOpen && (
        <UnlinkAccountConfirmationModal
          isOpen
          onOpenChange={setIsUnlinkConfirmationModalOpen}
          account={account}
        />
      )}
    </LinkedAccountOptions>
  )
}
