import React, { useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import { BankTransaction, CategorizationStatus } from '../../types'
import { BankTransactionRow } from '../BankTransactionRow'
import { RadioButtonGroup } from '../RadioButtonGroup'

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
  (display: DisplayState) => (bankTransaction: BankTransaction) => {
    const categorized = CategorizedCategories.includes(
      bankTransaction.categorization_status,
    )
    const inReview = ReviewCategories.includes(
      bankTransaction.categorization_status,
    )
    return (
      (display === DisplayState.review && inReview) ||
      (display === DisplayState.categorized && categorized)
    )
  }

export const BankTransactions = () => {
  const [display, setDisplay] = useState<DisplayState>(DisplayState.review)
  const { data } = useBankTransactions()
  const bankTransactions = (data?.data || []).filter(filterVisibility(display))
  const onCategorizationDisplayChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) =>
    setDisplay(
      event.target.value === DisplayState.categorized
        ? DisplayState.categorized
        : DisplayState.review,
    )
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({})
  const toggleOpen = (id: string) =>
    setOpenRows({ ...openRows, [id]: !openRows[id] })
  return (
    <div className="bank-transactions" data-display={display}>
      <header>
        <h1>Transactions</h1>
        <RadioButtonGroup
          name="bank-transaction-display"
          buttons={[
            { label: 'To Review', value: DisplayState.review },
            { label: 'Categorized', value: DisplayState.categorized },
          ]}
          selected={display}
          onChange={onCategorizationDisplayChange}
        />
      </header>
      <div className="bank-transaction-table">
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
        {bankTransactions.map((bankTransaction: BankTransaction) => (
          <BankTransactionRow
            key={bankTransaction.id}
            dateFormat={dateFormat}
            bankTransaction={bankTransaction}
            isOpen={openRows[bankTransaction.id]}
            toggleOpen={toggleOpen}
          />
        ))}
      </div>
    </div>
  )
}
