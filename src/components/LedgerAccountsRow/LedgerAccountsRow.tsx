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
  const { form, editAccount, setShowARForAccountId } = useContext(
    LedgerAccountsContext,
  )
  const [isOpen, setIsOpen] = useState(false)

  const baseClass = classNames(
    'Layer__table-row',
    isOpen ? 'Layer__table-row--expanded' : 'Layer__table-row--collapsed',
    `Layer__table-row--depth-${depth}`,
    form?.accountId === account.id && 'Layer__table-row--active',
  )

  return (
    <>
      <tr className={baseClass} onClick={() => setIsOpen(!isOpen)}>
        <td className='Layer__table-cell Layer__coa__name'>
          <span className='Layer__table-cell-content'>
            <span
              className='Layer__table-cell-content-indentation'
              style={{
                paddingLeft: INDENTATION * depth + 16,
              }}
            >
              {account.sub_accounts && account.sub_accounts.length > 0 && (
                <ChevronDownFill
                  size={16}
                  className='Layer__table__expand-icon'
                />
              )}
              <span className='Layer__coa__name__text'>{account.name}</span>
            </span>
          </span>
        </td>
        <td className='Layer__table-cell Layer__coa__type'>
          {/* @TODO what is type and subtype*/}
          <span className='Layer__table-cell-content'>{account.normality}</span>
        </td>
        <td className='Layer__table-cell Layer__coa__subtype'>
          <span className='Layer__table-cell-content'>Sub-Type</span>
        </td>
        <td className='Layer__table-cell Layer__coa__balance'>
          <span className='Layer__table-cell-content Layer__table-cell--amount'>
            ${centsToDollars(Math.abs(account.balance || 0))}
          </span>
        </td>
        <td className='Layer__table-cell Layer__coa__actions'>
          <span className='Layer__table-cell-content'>
            <Button
              variant={ButtonVariant.secondary}
              rightIcon={<Edit2 size={12} />}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                editAccount(account.id)
              }}
            >
              Edit
            </Button>
            <Button
              variant={ButtonVariant.secondary}
              rightIcon={<ArrowRightCircle size={12} />}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                setShowARForAccountId(account.id)
              }}
            >
              Open
            </Button>
          </span>
        </td>
      </tr>
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
