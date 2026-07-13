import { useContext, useState } from 'react'
import { GridListItem } from 'react-aria-components/GridList'
import { useTranslation } from 'react-i18next'

import { type BankAccount } from '@schemas/bankAccounts/bankAccount'
import { getBankAccountDisplayName, getBankAccountInstitution, isAllExternalAccountsUserCreatedCustom } from '@utils/bankAccount'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { OpeningBalanceModalContext } from '@contexts/OpeningBalanceModalContext/OpeningBalanceModalContext'
import { LinkedAccountOptions, type LinkedAccountOptionsConfig } from '@components/LinkedAccountOptions/LinkedAccountOptions'
import { LinkedAccountPill } from '@components/LinkedAccountPill/LinkedAccountPill'
import { UnlinkAccountConfirmationModal } from '@components/LinkedAccounts/UnlinkAccountConfirmationModal/UnlinkAccountConfirmationModal'
import { LinkedAccountThumb } from '@components/LinkedAccountThumb/LinkedAccountThumb'

function accountNeedsUniquenessConfirmation(bankAccount: BankAccount) {
  return bankAccount.externalAccounts.some(
    ea => ea.notifications.some(({ type }) => type === 'CONFIRM_UNIQUE'),
  )
}

function accountMissingOpeningBalance(bankAccount: BankAccount) {
  return bankAccount.notifications.some(({ type }) => type === 'OPENING_BALANCE_MISSING')
}

function getConnectionRepairInfo(bankAccount: BankAccount) {
  const brokenAccount = bankAccount.externalAccounts.find(ea => ea.connectionNeedsRepairAsOf)
  if (!brokenAccount) return null
  return {
    connectionExternalId: brokenAccount.connectionExternalId,
    source: brokenAccount.externalAccountSource,
    reconnectWithNewCredentials: brokenAccount.reconnectWithNewCredentials,
  }
}

function getPlaidAccount(bankAccount: BankAccount) {
  return bankAccount.externalAccounts.find(ea => ea.externalAccountSource === 'PLAID')
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
  const { t } = useTranslation()
  const {
    addConnection,
    removeConnection,
    repairConnection,
    confirmAccount,
    excludeAccount,
    breakConnection,
  } = useContext(LinkedAccountsContext)
  const { setAccountsToAddOpeningBalanceInModal } = useContext(OpeningBalanceModalContext)
  const { environment } = useEnvironment()
  const [isUnlinkConfirmationModalOpen, setIsUnlinkConfirmationModalOpen] = useState(false)

  const plaidAccount = getPlaidAccount(bankAccount)
  const repairInfo = getConnectionRepairInfo(bankAccount)

  let pillConfig
  if (accountNeedsUniquenessConfirmation(bankAccount)) {
    const plaidAccountForConfirm = bankAccount.externalAccounts.find(
      ea => ea.notifications.some(({ type }) => type === 'CONFIRM_UNIQUE'),
    )
    if (plaidAccountForConfirm) {
      pillConfig = {
        text: t('linkedAccounts:action.confirm_account', 'Confirm account'),
        config: [
          {
            name: t('linkedAccounts:action.mark_duplicate_account', 'Mark as a duplicate account'),
            action: () => {
              void excludeAccount(plaidAccountForConfirm.externalAccountSource, plaidAccountForConfirm.id)
            },
          },
          {
            name: t('linkedAccounts:action.mark_not_duplicate_account', 'Mark as not a duplicate account'),
            action: () => {
              void confirmAccount(plaidAccountForConfirm.externalAccountSource, plaidAccountForConfirm.id)
            },
          },
        ],
      }
    }
  }
  else if (repairInfo) {
    pillConfig = {
      text: t('linkedAccounts:action.fix_account', 'Fix account'),
      config: [
        {
          name: t('linkedAccounts:action.repair_connection', 'Repair connection'),
          action: () => {
            if (!repairInfo.connectionExternalId) return
            if (repairInfo.reconnectWithNewCredentials) {
              void addConnection(repairInfo.source)
            }
            else {
              void repairConnection(repairInfo.source, repairInfo.connectionExternalId)
            }
          },
        },
      ],
    }
  }

  const additionalConfigs: LinkedAccountOptionsConfig = []

  additionalConfigs.push({
    name: isAllExternalAccountsUserCreatedCustom(bankAccount) ? t('linkedAccounts:action.delete_account', 'Delete account') : t('linkedAccounts:action.unlink_account', 'Unlink account'),
    action: () => {
      setIsUnlinkConfirmationModalOpen(true)
    },
  })

  if (showUnlinkItem && plaidAccount?.connectionExternalId) {
    const institutionName = getBankAccountInstitution(bankAccount)?.name
    const removeAllAccountsConfirmationMessage = institutionName
      ? t(
        'linkedAccounts:label.confirm_remove_accounts_for_institution_name',
        'Please confirm you wish to remove all accounts belonging to {{institutionName}}',
        { institutionName },
      )
      : t(
        'linkedAccounts:label.confirm_remove_accounts_for_institution',
        'Please confirm you wish to remove all accounts belonging to this institution',
      )
    additionalConfigs.push({
      name: institutionName
        ? t('linkedAccounts:action.unlink_accounts_under_institution_name', 'Unlink all accounts under this {{institutionName}} connection', { institutionName })
        : t('linkedAccounts:action.unlink_accounts_under_connection', 'Unlink all accounts under this connection'),
      action: () => {
        // TODO: replace with better confirm dialog
        if (
          plaidAccount.connectionExternalId
          && confirm(removeAllAccountsConfirmationMessage)
        ) {
          void removeConnection(
            plaidAccount.externalAccountSource,
            plaidAccount.connectionExternalId,
          )
        }
      },
    })
  }

  if (accountMissingOpeningBalance(bankAccount)) {
    additionalConfigs.push({
      name: t('linkedAccounts:action.add_opening_balance', 'Add opening balance'),
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
        if (plaidAccount.connectionExternalId) {
          void breakConnection(
            plaidAccount.externalAccountSource,
            plaidAccount.connectionExternalId,
          )
        }
        else {
          console.warn('Account doesn\'t have defined connectionExternalId')
        }
      },
    })
  }

  return (
    <GridListItem
      id={bankAccount.id}
      textValue={getBankAccountDisplayName(bankAccount)}
      className='Layer__linked-accounts__item'
    >
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
    </GridListItem>
  )
}
