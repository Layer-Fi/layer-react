import React, { useRef, useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import CheckedCircle from '../../icons/CheckedCircle'
import ChevronDown from '../../icons/ChevronDown'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction, CategorizationType, Direction } from '../../types'
import { Button } from '../Button'
import { CategoryMenu } from '../CategoryMenu'
import { ExpandedBankTransactionRow } from '../ExpandedBankTransactionRow'
import { SaveHandle } from '../ExpandedBankTransactionRow/ExpandedBankTransactionRow'
import { Pill } from '../Pill'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

type Props = {
  dateFormat: string
  bankTransaction: BankTransaction
  isOpen: boolean
  toggleOpen: (id: string) => void
  editable: boolean
}

const isCredit = ({ direction }: Pick<BankTransaction, 'direction'>) =>
  direction === Direction.CREDIT

export const BankTransactionRow = ({
  dateFormat,
  bankTransaction,
  isOpen,
  toggleOpen,
  editable,
}: Props) => {
  const expandedRowRef = useRef<SaveHandle>(null)
  const [removed, setRemoved] = useState(false)
  const { categorize: categorizeBankTransaction } = useBankTransactions()
  const [selectedCategory, setSelectedCategory] = useState(
    bankTransaction.categorization_flow?.type ===
      CategorizationType.ASK_FROM_SUGGESTIONS
      ? bankTransaction.categorization_flow.suggestions[0]
      : undefined,
  )

  const save = () => {
    // Save using form from expanded row when row is open:
    if (isOpen && expandedRowRef?.current) {
      expandedRowRef?.current?.save()
      toggleOpen(bankTransaction.id)
      return
    }

    categorizeBankTransaction(bankTransaction.id, {
      type: 'Category',
      category: {
        type: 'StableName',
        stable_name:
          selectedCategory?.stable_name || selectedCategory?.category || '',
      },
    })
  }

  if (removed) {
    return null
  }

  const className = 'Layer__bank-transaction-row'
  const openClassName = isOpen ? `${className}--expanded` : ''
  const rowClassName = classNames(
    className,
    bankTransaction.recently_categorized
      ? 'Layer__bank-transaction-row--removing'
      : '',
    isOpen ? openClassName : '',
  )

  return (
    <>
      <tr
        className={rowClassName}
        onTransitionEnd={({ propertyName }) => {
          if (propertyName === 'top') {
            setRemoved(true)
          }
        }}
      >
        <td className='Layer__table-cell'>
          <span className='Layer__table-cell-content'>
            {formatTime(parseISO(bankTransaction.date), dateFormat)}
          </span>
        </td>
        <td className='Layer__table-cell'>
          <span className='Layer__table-cell-content'>
            {bankTransaction.counterparty_name}
          </span>
        </td>
        <td className='Layer__table-cell'>
          <span className='Layer__table-cell-content'>
            {bankTransaction.account_name ?? ''}
          </span>
        </td>
        <td
          className={`Layer__table-cell Layer__table-cell--amount ${className}__table-cell--amount-${
            isCredit(bankTransaction) ? 'credit' : 'debit'
          }`}
        >
          <span className='Layer__table-cell-content'>
            {formatMoney(bankTransaction.amount)}
          </span>
        </td>
        <td
          className={classNames(
            'Layer__table-cell',
            `${className}__actions-cell`,
            `${className}__actions-cell--${isOpen ? 'open' : 'close'}`,
          )}
        >
          <span
            className={`${className}__actions-container Layer__table-cell-content`}
          >
            {editable && !isOpen ? (
              <CategoryMenu
                bankTransaction={bankTransaction}
                name={`category-${bankTransaction.id}`}
                value={selectedCategory}
                onChange={setSelectedCategory}
                disabled={bankTransaction.processing}
              />
            ) : null}
            {!editable ? (
              <Pill>{bankTransaction?.category?.display_name}</Pill>
            ) : null}
            <Button
              onClick={() => {
                if (!bankTransaction.processing) {
                  save()
                }
              }}
              disabled={bankTransaction.processing}
            >
              Approve
            </Button>
            <div
              onClick={() => toggleOpen(bankTransaction.id)}
              className='Layer__bank-transaction-row__expand-button'
            >
              <ChevronDown
                className={`Layer__chevron ${
                  isOpen ? 'Layer__chevron__up' : 'Layer__chevron__down'
                }`}
              />
            </div>
          </span>
        </td>
      </tr>
      <ExpandedBankTransactionRow
        ref={expandedRowRef}
        bankTransaction={bankTransaction}
        close={() => toggleOpen(bankTransaction.id)}
        isOpen={isOpen}
      />
      {/* <tr>
        {bankTransaction.error && (
          <div className='Layer__bank-transaction-row__error-row'>
            <span className='Layer__bank-transaction-row__error-row__message'>
              {bankTransaction.error}
            </span>
          </div>
        )}
      </tr> */}
    </>
  )
}
