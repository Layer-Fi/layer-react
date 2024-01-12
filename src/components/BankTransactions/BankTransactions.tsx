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
    const inReview =
      ReviewCategories.includes(bankTransaction.categorization_status) ||
      bankTransaction.recently_categorized

    return (
      (display === DisplayState.review && inReview) ||
      (display === DisplayState.categorized && categorized)
    )
  }

export const BankTransactions = () => {
  const [display, setDisplay] = useState<DisplayState>(DisplayState.review)
  const { data } = useBankTransactions()
  const bankTransactions = data.filter(filterVisibility(display))
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
    <div className="Layer__component Layer__bank-transactions">
      <header className="Layer__bank-transactions__header">
        <h2 className="Layer__bank-transactions__title">Transactions</h2>
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
      <div className="Layer__bank-transactions__table">
        <div className="Layer__bank-transactions__table-cell Layer__bank-transactions__table-cell--header mobile">
          Date
        </div>
        <div className="Layer__bank-transactions__table-cell Layer__bank-transactions__table-cell--header">
          Transaction
        </div>
        <div className="Layer__bank-transactions__table-cell Layer__bank-transactions__table-cell--header">
          Account
        </div>
        <div className="Layer__bank-transactions__table-cell Layer__bank-transactions__table-cell--header Layer__bank-transactions__table-cell--header-amount mobile">
          Amount
        </div>
        <div className="Layer__bank-transactions__table-cell Layer__bank-transactions__table-cell--header">
          Category
        </div>
        <div className="Layer__bank-transactions__table-cell Layer__bank-transactions__table-cell--header mobile">
          Actions
        </div>
        {bankTransactions.map((bankTransaction: BankTransaction) => (
          <BankTransactionRow
            key={bankTransaction.id}
            dateFormat={dateFormat}
            bankTransaction={bankTransaction}
            isOpen={openRows[bankTransaction.id]}
            toggleOpen={toggleOpen}
            editable={display === DisplayState.review}
          />
        ))}
      </div>
    </div>
  )
}
