import React from 'react'
import InstitutionIcon from '../../icons/InstitutionIcon'
import { centsToDollars as formatMoney } from '../../models/Money'
import { LinkedAccount } from '../../types/linked_accounts'
import { Text, TextSize } from '../Typography'
import classNames from 'classnames'

export interface LinkedAccountThumbProps {
  account: LinkedAccount
  asWidget?: boolean
}

const AccountNumber = ({ accountNumber }: { accountNumber: string }) => (
  <div className='account-number'>
    <Text size={'sm' as TextSize}>•••{accountNumber}</Text>
  </div>
)

export const LinkedAccountThumb = ({
  account,
  asWidget,
}: LinkedAccountThumbProps) => {
  const linkedAccountThumbClassName = classNames(
    'Layer__linked-account-thumb',
    asWidget && '--as-widget',
  )

  return (
    <div className={linkedAccountThumbClassName}>
      <div className='topbar'>
        <div className='topbar-details'>
          <Text as='span' className='account-name'>
            {account.external_account_name}
          </Text>
          {!asWidget && (
            <AccountNumber accountNumber={account.external_account_number} />
          )}
          <Text
            as='span'
            className='account-institution'
            size={'sm' as TextSize}
          >
            {account.institution}
          </Text>
        </div>
        <div className='topbar-logo'>
          {!account.institutionLogo && <InstitutionIcon />}
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
          <Text as='span' className='account-balance'>
            ${formatMoney(account.latest_balance_timestamp.balance)}
          </Text>
        </div>
      )}
      <div className='bottombar'>
        {asWidget ? (
          <AccountNumber accountNumber={account.external_account_number} />
        ) : (
          <Text
            as='span'
            className='account-balance-text'
            size={'sm' as TextSize}
          >
            General ledger balance
          </Text>
        )}
        <Text as='span' className='account-balance'>
          ${formatMoney(account.current_ledger_balance)}
        </Text>
      </div>
    </div>
  )
}
