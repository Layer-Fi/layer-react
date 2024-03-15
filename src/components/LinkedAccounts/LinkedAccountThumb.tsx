import React from 'react'
import { centsToDollars as formatMoney } from '../../models/Money'
import { LinkedAccount } from '../../types/linked_accounts'
import { Text } from '../Typography'

export interface LinkedAccountThumbProps {
  account: LinkedAccount
}

export const LinkedAccountThumb = ({ account }: LinkedAccountThumbProps) => {
  return (
    <div className='Layer__linked-account-thumb'>
      <div className='topbar'>
        <Text as='span' className='account-name'>
          {account.name}
        </Text>
        <Text as='span' className='account-number'>
          •••{account.account}
        </Text>
      </div>
      <div className='bottombar'>
        <Text as='span' className='account-amount'>
          ${formatMoney(account.amount)}
        </Text>
      </div>
    </div>
  )
}
