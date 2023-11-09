import React from 'react'
import ChevronDown from '../../icons/ChevronDown'
import ChevronUp from '../../icons/ChevronUp'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction } from '../../types'
import { CategoryMenu } from '../CategoryMenu'
import { ExpandedBankTransactionRow } from '../ExpandedBankTransactionRow'
import { parseISO, format as formatTime } from 'date-fns'

type Props = {
  dateFormat: string
  bankTransaction: BankTransaction
  isOpen: boolean
  toggleOpen: (id: string) => void
}

const isCredit = ({ direction }: Pick<BankTransaction, 'direction'>) =>
  direction === 'CREDIT'

export const BankTransactionRow = ({
  dateFormat,
  bankTransaction,
  isOpen,
  toggleOpen,
}: Props) => (
  <>
    <div className={isOpen ? 'open-row' : ''}>
      <input type="checkbox" />
    </div>
    <div className={isOpen ? 'open-row' : ''}>
      {formatTime(parseISO(bankTransaction.date), dateFormat)}
    </div>
    <div className={isOpen ? 'open-row' : ''}>
      {isCredit(bankTransaction) ? '+' : '-'}$
      {formatMoney(bankTransaction.amount)}
    </div>
    <div className={isOpen ? 'open-row' : ''}>Business Checking</div>
    <div className={isOpen ? 'open-row' : ''}>
      {bankTransaction.counterparty_name}
    </div>
    <div
      className={isOpen ? 'open-row' : ''}
      data-selected={bankTransaction?.category?.category}
    >
      <CategoryMenu selectedCategory={bankTransaction?.category?.category} />
    </div>
    <div className={isOpen ? 'open-row' : ''}></div>
    <div
      className={`bank-transaction-expand ${isOpen ? 'open-row' : ''}`}
      onClick={() => toggleOpen(bankTransaction.id)}
    >
      {isOpen ? <ChevronUp /> : <ChevronDown />}
    </div>
    {isOpen && <ExpandedBankTransactionRow bankTransaction={bankTransaction} />}
  </>
)
