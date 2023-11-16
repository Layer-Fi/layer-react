import React, { useState } from 'react'
import CheckedCircle from '../../icons/CheckedCircle'
import ChevronDown from '../../icons/ChevronDown'
import ChevronUp from '../../icons/ChevronUp'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction } from '../../types'
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
  direction === 'CREDIT'

export const BankTransactionRow = ({
  dateFormat,
  bankTransaction,
  isOpen,
  toggleOpen,
  editable,
}: Props) => {
  const [selectedCategory, setSelectedCategory] = useState(
    bankTransaction.categorization_flow?.suggestions?.[0],
  )
  const className = 'Layer__bank-transaction-row__table-cell'
  const openClassName = isOpen ? `${className}--expanded` : ''
  return (
    <>
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
      {isOpen ? (
        <div className={`${className} ${openClassName}`}></div>
      ) : (
        <div className={`${className} ${openClassName}`}>
          {editable ? (
            <CategoryMenu
              bankTransaction={bankTransaction}
              name={`category-${bankTransaction.id}`}
              defaultValue={selectedCategory}
            />
          ) : (
            <Pill>{bankTransaction?.category?.display_name}</Pill>
          )}
        </div>
      )}
      <div className={`${className} ${openClassName} ${className}--actions`}>
        <div className="Layer__bank-transaction-row__save-button">
          {editable && !isOpen && (
            <CheckedCircle
              size={28}
              strokeColor="#0C48E5"
              fillColor="#e0e9ff"
            />
          )}
        </div>
        <div
          onClick={() => toggleOpen(bankTransaction.id)}
          className="Layer__bank-transaction-row__expand-button"
        >
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>
      {isOpen && (
        <ExpandedBankTransactionRow bankTransaction={bankTransaction} />
      )}
    </>
  )
}
