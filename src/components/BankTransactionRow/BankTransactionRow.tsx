import React, { useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import CheckedCircle from '../../icons/CheckedCircle'
import ChevronDown from '../../icons/ChevronDown'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction, CategorizationType, Direction } from '../../types'
import { CategoryMenu } from '../CategoryMenu'
import { ExpandedBankTransactionRow } from '../ExpandedBankTransactionRow'
import { Pill } from '../Pill'
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
  const [removed, setRemoved] = useState(false)
  const { categorize: categorizeBankTransaction } = useBankTransactions()
  const [selectedCategory, setSelectedCategory] = useState(
    bankTransaction.categorization_flow?.type ===
      CategorizationType.ASK_FROM_SUGGESTIONS
      ? bankTransaction.categorization_flow.suggestions[0]
      : undefined,
  )
  const className = 'Layer__bank-transaction-row__table-cell'
  const openClassName = isOpen ? `${className}--expanded` : ''

  const save = () =>
    categorizeBankTransaction(bankTransaction.id, {
      type: 'Category',
      category: {
        type: 'StableName',
        stable_name:
          selectedCategory?.stable_name || selectedCategory?.category || '',
      },
    })

  if (removed) {
    return null
  }

  return (
    <div
      className={`Layer__bank-transaction-row__container ${
        bankTransaction.recently_categorized
          ? 'Layer__bank-transaction-row__container--removing'
          : ''
      }`}
      onTransitionEnd={({ propertyName }) => {
        if (propertyName === 'top') {
          setRemoved(true)
        }
      }}
    >
      <div className='Layer__bank-transaction-row__content'>
        <div className={`${className} ${openClassName} ${className}--date`}>
          {formatTime(parseISO(bankTransaction.date), dateFormat)}
        </div>
        <div className={`${className} ${openClassName}`}>
          {bankTransaction.counterparty_name}
        </div>
        <div className={`${className} ${openClassName}`}>Business Checking</div>
        <div
          className={`${className} ${openClassName} ${className}--amount-${
            isCredit(bankTransaction) ? 'credit' : 'debit'
          }`}
        >
          {formatMoney(bankTransaction.amount)}
        </div>
        <div
          className={`${className} ${openClassName} ${
            isOpen && 'Layer__bank-transaction-row__table-cell--hide-contents'
          }`}
        >
          {editable ? (
            <CategoryMenu
              bankTransaction={bankTransaction}
              name={`category-${bankTransaction.id}`}
              value={selectedCategory}
              onChange={setSelectedCategory}
              disabled={bankTransaction.processing}
            />
          ) : (
            <Pill>{bankTransaction?.category?.display_name}</Pill>
          )}
        </div>
        <div className={`${className} ${openClassName} ${className}--actions`}>
          <div
            className='Layer__bank-transaction-row__save-button'
            onClick={() => {
              if (!bankTransaction.processing) {
                save()
              }
            }}
          >
            {editable && !isOpen && (
              <CheckedCircle
                size={28}
                strokeColor='#0C48E5'
                fillColor='#e0e9ff'
                opacity={bankTransaction.processing ? 0.2 : 1}
              />
            )}
          </div>
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
        </div>
        <ExpandedBankTransactionRow
          bankTransaction={bankTransaction}
          close={() => toggleOpen(bankTransaction.id)}
          isOpen={isOpen}
        />
        {bankTransaction.error && (
          <div className='Layer__bank-transaction-row__error-row'>
            <span className='Layer__bank-transaction-row__error-row__message'>
              {bankTransaction.error}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
