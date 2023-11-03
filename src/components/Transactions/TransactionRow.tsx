import React from 'react'
import { Money } from '../../models/Money'
import { Transaction } from '../../types'
import { CategoryMenu } from '../CategoryMenu'
import { parseISO, format as formatTime } from 'date-fns'

type Props = {
  dateFormat: string
  transaction: Transaction
  isOpen: boolean
  toggleOpen: (id: string) => void
}

export const TransactionRow = ({
  dateFormat,
  transaction,
  isOpen,
  toggleOpen,
}: Props) => (
  <>
    <div>
      <input type="checkbox" />
    </div>
    <div>{formatTime(parseISO(transaction.date), dateFormat)}</div>
    <div>{Money.format(transaction)}</div>
    <div>Business Checking</div>
    <div>{transaction.counterparty_name}</div>
    <div data-selected={transaction?.category?.category}>
      <CategoryMenu selectedCategory={transaction?.category?.category} />
    </div>
    <div></div>
    <div
      className="transaction-expand"
      onClick={() => toggleOpen(transaction.id)}
    >
      &#x1F3AF;
    </div>
    {isOpen && (
      <div className="expand-area">
        <div className="expand-content">Hello!</div>
      </div>
    )}
  </>
)
