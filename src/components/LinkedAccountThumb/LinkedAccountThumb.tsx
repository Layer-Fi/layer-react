import React from 'react'
import InstitutionIcon from '../../icons/InstitutionIcon'
import LoaderIcon from '../../icons/Loader'
import { centsToDollars as formatMoney } from '../../models/Money'
import { LinkedAccount } from '../../types/linked_accounts'
import { LinkedAccountPill } from '../LinkedAccountPill'
import { Text, TextSize } from '../Typography'
import classNames from 'classnames'

export interface LinkedAccountThumbProps {
  account: LinkedAccount
  asWidget?: boolean
  showLedgerBalance?: boolean
  pillConfig?: {
    text: string
    config: { name: string; action: () => void }[]
  }
}

const AccountNumber = ({ accountNumber }: { accountNumber: string }) => (
  <div className='account-number'>
    <Text size={'sm' as TextSize}>••• {accountNumber}</Text>
  </div>
)

export const LinkedAccountThumb = ({
  account,
  asWidget,
  showLedgerBalance,
  pillConfig,
}: LinkedAccountThumbProps) => {
  const linkedAccountThumbClassName = classNames(
    'Layer__linked-account-thumb',
    asWidget && '--as-widget',
    account.is_syncing && '--is-syncing',
    account.is_syncing && 'skeleton-loader',
    showLedgerBalance && '--show-ledger-balance',
  )

  const linkedAccountInfoClassName = classNames(
    'topbar',
    account.is_syncing && '--is-syncing',
    !(showLedgerBalance || account.is_syncing) && '--hide-ledger-balance',
  )

  let bankBalance: React.ReactNode
  if (pillConfig) {
    bankBalance = (
      <LinkedAccountPill text={pillConfig.text} config={pillConfig.config} />
    )
  } else {
    bankBalance = (
      <Text as='span' className='account-balance'>
        {`${formatMoney(account.latest_balance_timestamp?.balance)}`}
      </Text>
    )
  }

  return (
    <div className={linkedAccountThumbClassName}>
      <div className={linkedAccountInfoClassName}>
        <div className='topbar-details'>
          <Text as='div' className='account-name'>
            {account.external_account_name}
          </Text>
          {!asWidget && account.mask && (
            <AccountNumber accountNumber={account.mask} />
          )}
          <Text
            as='span'
            className='account-institution'
            size={'sm' as TextSize}
          >
            {account.institution?.name
              ? account.institution?.name
              : account.external_account_name}
          </Text>
        </div>
        <div className='topbar-logo'>
          {account.institution?.logo != undefined ? (
            <img
              width={28}
              height={28}
              src={`data:image/png;base64,${account.institution.logo}`}
              alt={
                account.institution?.name
                  ? account.institution?.name
                  : account.external_account_name
              }
            />
          ) : (
            <InstitutionIcon />
          )}
        </div>
      </div>
      {account.is_syncing ? (
        <div className='loadingbar'>
          <div className='loading-text Layer__text--sm'>
            <div>Syncing account data</div>
            <div className='syncing-data-description'>
              This may take up to 5 minutes
            </div>
          </div>
          <div className='loading-wrapper'>
            <LoaderIcon size={11} className='Layer__anim--rotating' />
          </div>
        </div>
      ) : (
        <>
          {!asWidget && (
            <div className='middlebar'>
              <Text
                as='span'
                className={classNames(
                  'account-balance-text',
                  !showLedgerBalance && '--hide-ledger-balance',
                )}
                size={'sm' as TextSize}
              >
                Bank balance
              </Text>
              {bankBalance}
            </div>
          )}
          {showLedgerBalance && (
            <div className='bottombar'>
              {asWidget && account.mask ? (
                <AccountNumber accountNumber={account.mask} />
              ) : (
                <Text
                  as='span'
                  className='account-balance-text'
                  size={'sm' as TextSize}
                >
                  Ledger balance
                </Text>
              )}
              <Text as='span' className='account-balance'>
                {`${formatMoney(account.current_ledger_balance)}`}
              </Text>
            </div>
          )}
        </>
      )}
    </div>
  )
}
