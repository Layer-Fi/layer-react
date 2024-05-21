import React from 'react'
import InstitutionIcon from '../../icons/InstitutionIcon'
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
  )

  let balance: React.ReactNode
  if (pillConfig) {
    balance = (
      <LinkedAccountPill text={pillConfig.text} config={pillConfig.config} />
    )
  } else {
    balance = (
      <Text as='span' className='account-balance'>
        ${formatMoney(account.latest_balance_timestamp?.balance)}
      </Text>
    )
  }

  return (
    <div className={linkedAccountThumbClassName}>
      <div className='topbar'>
        <div className='topbar-details'>
          <Text as='span' className='account-name'>
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
            {account.institution?.name}
          </Text>
        </div>
        <div className='topbar-logo'>
          {account.institution?.logo != undefined ? (
            <img
              width={28}
              height={28}
              src={`data:image/png;base64,${account.institution.logo}`}
              alt={account.institution?.name}
            />
          ) : (
            <InstitutionIcon />
          )}
        </div>
      </div>
      {!asWidget && (
        <div className='middlebar'>
          <Text
            as='span'
            className='account-balance-text'
            size={'sm' as TextSize}
          >
            Bank balance
          </Text>
          {balance}
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
            ${formatMoney(account.current_ledger_balance)}
          </Text>
        </div>
      )}
    </div>
  )
}
