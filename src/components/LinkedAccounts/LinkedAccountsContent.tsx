import React, { useContext } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import PlusIcon from '../../icons/PlusIcon'
import { LinkedAccountOptions } from '../LinkedAccountOptions'
import { LinkedAccountThumb } from '../LinkedAccountThumb'
import { Text, TextSize } from '../Typography'
import classNames from 'classnames'

interface LinkedAccountsDataProps {
  asWidget?: boolean
  showLedgerBalance?: boolean
  showUnlinkItem?: boolean
  showBreakConnection?: boolean
}

export const LinkedAccountsContent = ({
  asWidget,
  showLedgerBalance,
  showUnlinkItem,
  showBreakConnection,
}: LinkedAccountsDataProps) => {
  const {
    data,
    addConnection,
    unlinkAccount,
    removeConnection,
    repairConnection,
    confirmAccount,
    denyAccount,
    breakConnection,
  } = useContext(LinkedAccountsContext)
  const { environment } = useLayerContext()

  const linkedAccountsNewAccountClassName = classNames(
    'Layer__linked-accounts__new-account',
    asWidget && '--as-widget',
    showLedgerBalance && '--show-ledger-balance',
    showUnlinkItem && '--show-unlink-item',
    showBreakConnection && '--show-break-connection',
  )

  return (
    <div className='Layer__linked-accounts__list'>
      {data?.map((account, index) => {
        let pillConfig
        if (account.requires_user_confirmation_as_of) {
          pillConfig = {
            text: 'Confirm account',
            config: [
              {
                name: 'Mark as a duplicate account',
                action: async () => {
                  // TODO: trigger some sort of loading spinner here
                  await denyAccount(account.external_account_source, account.id)
                  // TODO: turn off loading spinner
                },
              },
              {
                name: 'Mark as not a duplicate account',
                action: async () => {
                  // TODO: trigger some sort of loading spinner here
                  await confirmAccount(
                    account.external_account_source,
                    account.id,
                  )
                  // TODO: turn off loading spinner
                },
              },
            ],
          }
        } else if (account.connection_needs_repair_as_of) {
          pillConfig = {
            text: 'Fix account',
            config: [
              {
                name: 'Repair connection',
                action: async () => {
                  if (account.connection_external_id) {
                    // TODO: trigger some sort of loading spinner here
                    // An account is "broken" when its connection is broken
                    await repairConnection(
                      account.external_account_source,
                      account.connection_external_id,
                    )
                    // TODO: turn off loading spinner
                  }
                },
              },
            ],
          }
        }

        const additionalConfigs = [
          {
            name: 'Unlink account',
            action: async () => {
              // TODO: replace with better confirm dialog
              if (
                confirm(
                  'Please confirm you wish to remove this financial account',
                )
              ) {
                // TODO: trigger some sort of loading spinner here
                await unlinkAccount(account.external_account_source, account.id)
              }
              // TODO: turn off loading spinner
            },
          },
        ]

        if (showUnlinkItem) {
          additionalConfigs.push({
            name: `Unlink all accounts under this ${account.institution?.name} connection`,
            action: async () => {
              // TODO: replace with better confirm dialog
              if (
                account.connection_external_id &&
                confirm(
                  `Please confirm you wish to remove all accounts belonging to ${
                    account.institution?.name || 'this institution'
                  }`,
                )
              ) {
                // TODO: trigger some sort of loading spinner here
                await removeConnection(
                  account.external_account_source,
                  account.connection_external_id,
                )
                // TODO: turn off loading spinner
              }
            },
          })
        }

        if (
          environment === 'staging' &&
          !account.connection_needs_repair_as_of &&
          account.external_account_source === 'PLAID' &&
          showBreakConnection
        ) {
          additionalConfigs.push({
            name: 'Break connection (test utility)',
            action: async () => {
              if (account.connection_external_id) {
                await breakConnection(
                  account.external_account_source,
                  account.connection_external_id,
                )
              } else {
                console.warn(
                  "Account doesn't have defined connection_external_id",
                )
              }
            },
          })
        }

        return (
          <LinkedAccountOptions
            key={`linked-acc-${index}`}
            config={[
              ...additionalConfigs,
              ...(pillConfig ? pillConfig.config : []),
            ]}
            showLedgerBalance={showLedgerBalance}
          >
            <LinkedAccountThumb
              account={account}
              asWidget={asWidget}
              showLedgerBalance={showLedgerBalance}
              pillConfig={pillConfig}
            />
          </LinkedAccountOptions>
        )
      })}
      <div
        role='button'
        tabIndex={0}
        aria-label='new-account'
        onClick={() => addConnection('PLAID')}
        className={linkedAccountsNewAccountClassName}
      >
        <div className='Layer__linked-accounts__new-account-label'>
          <PlusIcon size={15} />
          <Text as='span' size={'sm' as TextSize}>
            Add Account
          </Text>
        </div>
      </div>
    </div>
  )
}
