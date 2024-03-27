import React, { useContext, useState } from 'react'
import ArrowRightCircle from '../../icons/ArrowRightCircle'
import ChevronDownFill from '../../icons/ChevronDownFill'
import Edit2 from '../../icons/Edit2'
import { centsToDollars } from '../../models/Money'
import { Account } from '../../types'
import { Button, ButtonVariant } from '../Button'
import { LedgerAccountsContext } from '../LedgerAccounts/LedgerAccounts'
import classNames from 'classnames'

type LedgerAccountsRowProps = {
  account: Account
  depth?: number
}

const INDENTATION = 12

export const LedgerAccountsRow = ({
  account,
  depth = 0,
}: LedgerAccountsRowProps) => {
  const { editAccount } = useContext(LedgerAccountsContext)
  const [isOpen, setIsOpen] = useState(false)

  const baseClass = classNames(
    'Layer__alt-table-row',
    isOpen
      ? 'Layer__alt-table-row--expanded'
      : 'Layer__alt-table-row--collapsed',
    `Layer__alt-table-row--depth-${depth}`,
  )

  return (
    <>
      <div className={baseClass} onClick={() => setIsOpen(!isOpen)}>
        <div
          className='Layer__alt-table__cell Layer__coa__name'
          style={{ paddingLeft: INDENTATION * depth + 16 }}
        >
          {account.sub_accounts && account.sub_accounts.length > 0 && (
            <ChevronDownFill
              size={16}
              className='Layer__alt-table__expand-icon'
            />
          )}
          <span className='Layer__coa__name__text'>{account.name}</span>
        </div>
        <div className='Layer__alt-table__cell Layer__coa__type'>
          {/* @TODO what is type and subtype*/}
          {account.normality}
        </div>
        <div className='Layer__alt-table__cell Layer__coa__subtype'>
          Sub-Type
        </div>
        <div className='Layer__alt-table__cell Layer__coa__balance'>
          ${centsToDollars(Math.abs(account.balance || 0))}
        </div>
        <div className='Layer__alt-table__cell Layer__coa__actions'>
          <Button
            variant={ButtonVariant.secondary}
            rightIcon={<Edit2 size={12} />}
            onClick={() => editAccount(account.id)}
          >
            Edit
          </Button>
          <Button
            variant={ButtonVariant.secondary}
            rightIcon={<ArrowRightCircle size={12} />}
          >
            Open
          </Button>
        </div>
      </div>
      {isOpen &&
        (account.sub_accounts || []).map(subAccount => (
          <LedgerAccountsRow
            key={subAccount.id}
            account={subAccount}
            depth={depth + 1}
          />
        ))}
    </>
  )
}
