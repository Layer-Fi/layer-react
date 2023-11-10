import React from 'react'
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
  const className = `bank-transactions__table-cell ${
    isOpen ? 'bank-transactions__table-cell--expanded' : ''
  }`
  return (
    <>
      <div className={className}>
        <input classNamw="bank-transactions__checkbox" type="checkbox" />
      </div>
      <div className={className}>
        {formatTime(parseISO(bankTransaction.date), dateFormat)}
      </div>
      <div className={className}>
        {isCredit(bankTransaction) ? '+' : '-'}$
        {formatMoney(bankTransaction.amount)}
      </div>
      <div className={className}>Business Checking</div>
      <div className={className}>{bankTransaction.counterparty_name}</div>
      <div className={className}>
        {editable ? (
          <CategoryMenu
            defaultdCategory={bankTransaction?.category?.category}
          />
        ) : (
          <Pill>{bankTransaction?.category?.display_name}</Pill>
        )}
      </div>
      <div className={className}></div>
      <div className={className} onClick={() => toggleOpen(bankTransaction.id)}>
        <div className="bank-transaction-table__expand-button">
          {isOpen ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>
      {isOpen && (
        <ExpandedBankTransactionRow bankTransaction={bankTransaction} />
      )}
    </>
  )
}
