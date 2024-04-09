import React from 'react'
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
            {account.accountName}
          </Text>
          {!asWidget && <AccountNumber accountNumber={account.accountNumber} />}
          <Text
            as='span'
            className='account-institution'
            size={'sm' as TextSize}
          >
            {account.institution}
          </Text>
        </div>
        <div className='topbar-logo'>
          {/* <img
            src={account.institutionLogo}
            alt={`${account.institution}-logo`}
          /> */}
        </div>
      </div>
      {!asWidget && (
        <div className='middlebar'>
          <Text
            as='span'
            className='account-balance-text'
            size={'sm' as TextSize}
          >
            Bank Balance
          </Text>
          <Text as='span' className='account-balance'>
            ${formatMoney(account.latestBalance)}
          </Text>
        </div>
      )}
      <div className='bottombar'>
        {asWidget ? (
          <AccountNumber accountNumber={account.accountNumber} />
        ) : (
          <Text
            as='span'
            className='account-balance-text'
            size={'sm' as TextSize}
          >
            Ledger Balance
          </Text>
        )}
        <Text as='span' className='account-balance'>
          ${formatMoney(account.ledgerBalance)}
        </Text>
      </div>
    </div>
  )
}
