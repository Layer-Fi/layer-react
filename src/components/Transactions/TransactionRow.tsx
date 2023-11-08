import React from 'react'
import ChevronDown from '../../icons/ChevronDown'
import ChevronUp from '../../icons/ChevronUp'
import { centsToDollars as formatMoney } from '../../models/Money'
import { Transaction } from '../../types'
import { CategoryMenu } from '../CategoryMenu'
import { ExpandedTransactionRow } from '../ExpandedTransactionRow'
import { parseISO, format as formatTime } from 'date-fns'

type Props = {
  dateFormat: string
  transaction: Transaction
  isOpen: boolean
  toggleOpen: (id: string) => void
}

const isCredit = ({ direction }: Pick<Transaction, 'direction'>) =>
  direction === 'CREDIT'

export const TransactionRow = ({
  dateFormat,
  transaction,
  isOpen,
  toggleOpen,
}: Props) => (
  <>
    <div className={isOpen ? 'open-row' : ''}>
      <input type="checkbox" />
    </div>
    <div className={isOpen ? 'open-row' : ''}>
      {formatTime(parseISO(transaction.date), dateFormat)}
    </div>
    <div className={isOpen ? 'open-row' : ''}>
      {isCredit(transaction) ? '+' : '-'}${formatMoney(transaction.amount)}
    </div>
    <div className={isOpen ? 'open-row' : ''}>Business Checking</div>
    <div className={isOpen ? 'open-row' : ''}>
      {transaction.counterparty_name}
    </div>
    <div
      className={isOpen ? 'open-row' : ''}
      data-selected={transaction?.category?.category}
    >
      <CategoryMenu selectedCategory={transaction?.category?.category} />
    </div>
    <div className={isOpen ? 'open-row' : ''}></div>
    <div
      className={`transaction-expand ${isOpen ? 'open-row' : ''}`}
      onClick={() => toggleOpen(transaction.id)}
    >
      {isOpen ? <ChevronUp /> : <ChevronDown />}
    </div>
    {isOpen && <ExpandedTransactionRow transaction={transaction} />}
  </>
)
