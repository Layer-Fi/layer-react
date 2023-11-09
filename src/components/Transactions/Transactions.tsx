import React, { useState } from 'react'
import { useTransactions } from '../../hooks/useTransactions'
import { Transaction, CategorizationStatus } from '../../types'
import { RadioButtonGroup } from '../RadioButtonGroup'
import { TransactionRow } from './TransactionRow'

const dateFormat = 'MM/dd/yyyy'

enum DisplayState {
  review = 'review',
  categorized = 'categorized',
}

const CategorizedCategories = [
  CategorizationStatus.CATEGORIZED,
  CategorizationStatus.JOURNALING,
  CategorizationStatus.SPLIT,
]
const ReviewCategories = [
  CategorizationStatus.READY_FOR_INPUT,
  CategorizationStatus.LAYER_REVIEW,
]

const filterVisibility =
  (display: DisplayState) => (transaction: Transaction) => {
    const categorized = CategorizedCategories.includes(
      transaction.categorization_status,
    )
    const inReview = ReviewCategories.includes(
      transaction.categorization_status,
    )
    return (
      (display === DisplayState.review && inReview) ||
      (display === DisplayState.categorized && categorized)
    )
  }

export const Transactions = () => {
  const [display, setDisplay] = useState<DisplayState>(DisplayState.review)
  const { data } = useTransactions()
  const transactions = (data?.data || []).filter(filterVisibility(display))
  const onCategorizationDisplayChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => setDisplay(event.target.value)
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({})
  const toggleOpen = (id: string) =>
    setOpenRows({ ...openRows, [id]: !openRows[id] })
  return (
    <div className="transactions" data-display={display}>
      <header>
        <h1>Transactions</h1>
        <RadioButtonGroup
          name="transaction-display"
          buttons={[
            { label: 'To Review', value: DisplayState.review },
            { label: 'Categorized', value: DisplayState.categorized },
          ]}
          selected={display}
          onChange={onCategorizationDisplayChange}
        />
      </header>
      <div className="transaction-table">
        <div className="header">
          <input type="checkbox" />
        </div>
        <div className="header">Date</div>
        <div className="header">Transaction</div>
        <div className="header">Account</div>
        <div className="header">Amount</div>
        <div className="header">Category</div>
        <div className="header">Action</div>
        <div className="header"></div>
        {transactions.map(transaction => (
          <TransactionRow
            key={transaction.id}
            dateFormat={dateFormat}
            transaction={transaction}
            isOpen={openRows[transaction.id]}
            toggleOpen={toggleOpen}
          />
        ))}
      </div>
    </div>
  )
}
