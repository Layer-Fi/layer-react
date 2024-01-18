import React, { useEffect, useRef, useState } from 'react'
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
  const componentRef = useRef<HTMLDivElement>(null)
  const [skeletonRows, setSkeletonRows] = useState(0)

  const [display, setDisplay] = useState<DisplayState>(DisplayState.review)
  const { data, isLoading } = useBankTransactions()
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

  useEffect(() => {
    if (componentRef.current) {
      const rows = Math.floor(componentRef.current.offsetHeight / 70) - 2
      console.log(componentRef.current.offsetHeight, rows)
      setSkeletonRows(rows)
    }
  }, [])

  useEffect(() => {
    if (componentRef.current && isLoading) {
      const rows = Math.floor(componentRef.current.offsetHeight / 70) - 2
      console.log(componentRef.current.offsetHeight, rows)
      setSkeletonRows(rows)
    }
  }, [isLoading])

  console.log('bankTransactions', bankTransactions)

  return (
    <div
      className='Layer__component Layer__bank-transactions'
      ref={componentRef}
    >
      <header className='Layer__bank-transactions__header'>
        <h2 className='Layer__bank-transactions__title'>Transactions</h2>
        <RadioButtonGroup
          name='bank-transaction-display'
          buttons={[
            { label: 'To Review', value: DisplayState.review },
            { label: 'Categorized', value: DisplayState.categorized },
          ]}
          selected={display}
          onChange={onCategorizationDisplayChange}
        />
      </header>
      <div className='Layer__bank-transactions__table'>
        <div className='Layer__bank-transactions__table-headers'>
          <div className='Layer__bank-transactions__table-cell Layer__bank-transactions__table-cell--header'>
            Date
          </div>
          <div className='Layer__bank-transactions__table-cell Layer__bank-transactions__table-cell--header'>
            Transaction
          </div>
          <div className='Layer__bank-transactions__table-cell Layer__bank-transactions__table-cell--header'>
            Account
          </div>
          <div className='Layer__bank-transactions__table-cell Layer__bank-transactions__table-cell--header Layer__bank-transactions__table-cell--header-amount'>
            Amount
          </div>
          <div className='Layer__bank-transactions__table-cell Layer__bank-transactions__table-cell--header'>
            Category
          </div>
          <div className='Layer__bank-transactions__table-cell Layer__bank-transactions__table-cell--header'>
            Actions
          </div>
        </div>

        {!isLoading && bankTransactions?.length > 0
          ? bankTransactions.map((bankTransaction: BankTransaction) => (
              <BankTransactionRow
                key={bankTransaction.id}
                dateFormat={dateFormat}
                bankTransaction={bankTransaction}
                isOpen={openRows[bankTransaction.id]}
                toggleOpen={toggleOpen}
                editable={display === DisplayState.review}
              />
            ))
          : null}
      </div>

      {isLoading || !bankTransactions || bankTransactions?.length === 0 ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            maxHeight: '100%',
            position: 'relative',
          }}
        >
          {[...Array(skeletonRows)].map((i, idx) => (
            <div key={idx} style={{ padding: 25, background: '#fff' }}>
              <div
                className='Layer__table-row__skeleton'
                style={{ width: '100%' }}
              />
            </div>
          ))}
          <div className='Layer__table-row__skeleton-overflow' />
        </div>
      ) : null}
    </div>
  )
}
