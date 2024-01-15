import React from 'react'
import { centsToDollars } from '../../models/Money'
import { Account } from '../../types'

type Props = {
  account: Account
  depth?: number
}

export const ChartOfAccountsRow = ({ account, depth = 0 }: Props) => {
  const classNames = [
    'Layer__chart-of-accounts-row__table-cell',
    depth > 0 && `Layer__chart-of-accounts-row__table-cell--depth-${depth}`,
  ]

  const className = classNames.filter(id => id).join(' ')

  const amountClassName =
    account.balance < 0
      ? 'Layer__chart-of-accounts-row__table-cell--amount-negative'
      : 'Layer__chart-of-accounts-row__table-cell--amount-positive'

  return (
    <>
      <div
        className={`${className} Layer__chart-of-accounts-row__table-cell--name`}
      >
        {account.name}
      </div>
      <div
        className={`${className} Layer__chart-of-accounts-row__table-cell--type`}
      >
        Assets
      </div>
      <div
        className={`${className} Layer__chart-of-accounts-row__table-cell--subtype`}
      >
        Cash
      </div>
      <div
        className={`${className} Layer__chart-of-accounts-row__table-cell--balance ${amountClassName}`}
      >
        {centsToDollars(Math.abs(account.balance || 0))}
      </div>
      <div
        className={`${className} Layer__chart-of-accounts-row__table-cell--actions`}
      >
        <button className='Layer__chart-of-accounts-row__view-entries-button'>
          View Entries
        </button>
      </div>
      {(account.subAccounts || []).map(subAccount => (
        <ChartOfAccountsRow
          key={subAccount.id}
          account={subAccount}
          depth={depth + 1}
        />
      ))}
    </>
  )
}
