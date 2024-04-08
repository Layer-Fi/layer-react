import React, { useContext, useEffect, useState } from 'react'
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
  index: number
  cumulativeIndex?: number
  expanded: boolean
  acountsLength: number
  defaultOpen?: boolean
}

const INDENTATION = 12

const EXPANDED_STYLE = {
  height: 52,
  paddingTop: 12,
  paddingBottom: 12,
  opacity: 1,
}

const COLLAPSED_STYLE = {
  height: 0,
  paddingTop: 0,
  paddingBottom: 0,
  opacity: 0.5,
}

export const LedgerAccountsRow = ({
  account,
  depth = 0,
  index,
  cumulativeIndex = 0,
  expanded = false,
  defaultOpen = false,
  acountsLength,
}: LedgerAccountsRowProps) => {
  const { form, editAccount, setShowARForAccountId } = useContext(
    LedgerAccountsContext,
  )
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const style = expanded
    ? {
        ...EXPANDED_STYLE,
        transitionDelay: `${15 * index}ms`,
      }
    : {
        ...COLLAPSED_STYLE,
        transitionDelay: `${acountsLength - 15 * index}ms`,
      }

  const [showComponent, setShowComponent] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowComponent(true)
    }, cumulativeIndex * 50)

    return () => clearTimeout(timeoutId)
  }, [])

  const baseClass = classNames(
    'Layer__table-row',
    isOpen ? 'Layer__table-row--expanded' : 'Layer__table-row--collapsed',
    !expanded && 'Layer__table-row--hidden',
    `Layer__table-row--depth-${depth}`,
    form?.accountId === account.id && 'Layer__table-row--active',
    !showComponent && 'Layer__table-row--anim-starting-state',
  )

  return (
    <>
      <tr className={baseClass} onClick={() => setIsOpen(!isOpen)}>
        <td className='Layer__table-cell Layer__coa__name'>
          <span className='Layer__table-cell-content' style={style}>
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
          <span className='Layer__table-cell-content' style={style}>
            {account.normality}
          </span>
        </td>
        <td className='Layer__table-cell Layer__coa__subtype'>
          <span className='Layer__table-cell-content' style={style}>
            Sub-Type
          </span>
        </td>
        <td className='Layer__table-cell Layer__coa__balance'>
          <span
            className='Layer__table-cell-content Layer__table-cell--amount'
            style={style}
          >
            ${centsToDollars(Math.abs(account.balance || 0))}
          </span>
        </td>
        <td className='Layer__table-cell Layer__coa__actions'>
          <span className='Layer__table-cell-content' style={style}>
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

      {(account.sub_accounts || []).map((subAccount, idx) => (
        <LedgerAccountsRow
          key={subAccount.id}
          account={subAccount}
          depth={depth + 1}
          index={idx}
          expanded={isOpen && expanded}
          cumulativeIndex={cumulativeIndex + idx + 1}
          acountsLength={(account.sub_accounts ?? []).length}
        />
      ))}
    </>
  )
}
