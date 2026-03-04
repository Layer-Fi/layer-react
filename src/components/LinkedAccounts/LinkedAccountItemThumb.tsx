import { useContext, useState } from 'react'

import { type BankAccount } from '@internal-types/linked_accounts'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import type { HoverMenuProps } from '@components/HoverMenu/HoverMenu'
import { LinkedAccountOptions } from '@components/LinkedAccountOptions/LinkedAccountOptions'
import { LinkedAccountPill } from '@components/LinkedAccountPill/LinkedAccountPill'
import { UnlinkAccountConfirmationModal } from '@components/LinkedAccounts/UnlinkAccountConfirmationModal/UnlinkAccountConfirmationModal'
import { LinkedAccountThumb } from '@components/LinkedAccountThumb/LinkedAccountThumb'

function accountNeedsUniquenessConfirmation(bankAccount: BankAccount) {
  return bankAccount.external_accounts.some(
    ea => ea.notifications?.some(({ type }) => type === 'CONFIRM_UNIQUE'),
  )
}

function accountMissingOpeningBalance(bankAccount: BankAccount) {
  return bankAccount.notifications.some(({ type }) => type === 'OPENING_BALANCE_MISSING')
}

function getConnectionRepairInfo(bankAccount: BankAccount) {
  const brokenAccount = bankAccount.external_accounts.find(ea => ea.connection_needs_repair_as_of)
  if (!brokenAccount) return null
  return {
    connectionExternalId: brokenAccount.connection_external_id,
    source: brokenAccount.external_account_source,
    reconnectWithNewCredentials: brokenAccount.reconnect_with_new_credentials,
  }
}

function getPlaidAccount(bankAccount: BankAccount) {
  return bankAccount.external_accounts.find(ea => ea.external_account_source === 'PLAID')
}

export interface LinkedAccountItemThumbProps {
  account: BankAccount
  asWidget?: boolean
  showLedgerBalance?: boolean
  showUnlinkItem?: boolean
  showBreakConnection?: boolean
}

export const LinkedAccountItemThumb = ({
  account: bankAccount,
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

  const plaidAccount = getPlaidAccount(bankAccount)
  const repairInfo = getConnectionRepairInfo(bankAccount)

  let pillConfig
  if (accountNeedsUniquenessConfirmation(bankAccount)) {
    const plaidAccountForConfirm = bankAccount.external_accounts.find(
      ea => ea.notifications?.some(({ type }) => type === 'CONFIRM_UNIQUE'),
    )
    if (plaidAccountForConfirm) {
      pillConfig = {
        text: 'Confirm account',
        config: [
          {
            name: 'Mark as a duplicate account',
            action: () => {
              void excludeAccount(plaidAccountForConfirm.external_account_source, plaidAccountForConfirm.id)
            },
          },
          {
            name: 'Mark as not a duplicate account',
            action: () => {
              void confirmAccount(plaidAccountForConfirm.external_account_source, plaidAccountForConfirm.id)
            },
          },
        ],
      }
    }
  }
  else if (repairInfo) {
    pillConfig = {
      text: 'Fix account',
      config: [
        {
          name: 'Repair connection',
          action: () => {
            if (repairInfo.connectionExternalId) {
              if (repairInfo.reconnectWithNewCredentials) {
                void addConnection(repairInfo.source)
              }
              else {
                void repairConnection(repairInfo.source, repairInfo.connectionExternalId)
              }
            }
          },
        },
      ],
    }
  }

  const additionalConfigs: HoverMenuProps['config'] = []

  additionalConfigs.push({
    name: 'Unlink account',
    action: () => {
      setIsUnlinkConfirmationModalOpen(true)
    },
  })

  if (showUnlinkItem && plaidAccount?.connection_external_id) {
    const institutionName = bankAccount.institution?.name
      ?? plaidAccount.institution?.name
    additionalConfigs.push({
      name: `Unlink all accounts under this ${institutionName} connection`,
      action: () => {
        // TODO: replace with better confirm dialog
        if (
          plaidAccount.connection_external_id
          && confirm(
            `Please confirm you wish to remove all accounts belonging to ${
              institutionName || 'this institution'
            }`,
          )
        ) {
          void removeConnection(
            plaidAccount.external_account_source,
            plaidAccount.connection_external_id,
          )
        }
      },
    })
  }

  if (accountMissingOpeningBalance(bankAccount)) {
    additionalConfigs.push({
      name: 'Add opening balance',
      action: () => {
        setAccountsToAddOpeningBalanceInModal([bankAccount])
      },
    })
  }

  if (
    environment === 'staging'
    && !repairInfo
    && plaidAccount
    && showBreakConnection
  ) {
    additionalConfigs.push({
      name: 'Break connection (test utility)',
      action: () => {
        if (plaidAccount.connection_external_id) {
          void breakConnection(
            plaidAccount.external_account_source,
            plaidAccount.connection_external_id,
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
        bankAccount={bankAccount}
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
          bankAccount={bankAccount}
        />
      )}
    </LinkedAccountOptions>
  )
}
