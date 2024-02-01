import React, { useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import { useElementSize } from '../../hooks/useElementSize'
import { BankTransaction, CategorizationStatus } from '../../types'
import { BankTransactionListItem } from '../BankTransactionListItem'
import { BankTransactionRow } from '../BankTransactionRow'
import { Container, Header } from '../Container'
import { Loader } from '../Loader'
import { Toggle } from '../Toggle'
import { Heading } from '../Typography'

const COMPONENT_NAME = 'bank-transactions'

const dateFormat = 'LLL d, yyyy'

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
  const [shiftStickyHeader, setShiftStickyHeader] = useState(0)

  const headerRef = useElementSize((_el, _en, size) => {
    if (size?.height && size?.height >= 90) {
      const newShift = -Math.floor(size.height / 2) + 6
      if (newShift !== shiftStickyHeader) {
        setShiftStickyHeader(newShift)
      }
    } else if (size?.height > 0 && shiftStickyHeader !== 0) {
      setShiftStickyHeader(0)
    }
  })

  const editable = display === DisplayState.review
  return (
    <Container name={COMPONENT_NAME}>
      <Header
        ref={headerRef}
        className='Layer__bank-transactions__header'
        style={{ top: shiftStickyHeader }}
      >
        <Heading className='Layer__bank-transactions__title'>
          Transactions
        </Heading>
        <Toggle
          name='bank-transaction-display'
          options={[
            { label: 'To Review', value: DisplayState.review },
            { label: 'Categorized', value: DisplayState.categorized },
          ]}
          selected={display}
          onChange={onCategorizationDisplayChange}
        />
      </Header>
      <div className='Layer__test-samples'>
        <div className='Layer__test-sample c50' />
        <div className='Layer__test-sample c100' />
        <div className='Layer__test-sample c200' />
        <div className='Layer__test-sample c300' />
        <div className='Layer__test-sample c400' />
        <div className='Layer__test-sample c500' />
        <div className='Layer__test-sample c600' />
        <div className='Layer__test-sample c700' />
        <div className='Layer__test-sample c800' />
        <div className='Layer__test-sample c900' />
        <div className='Layer__test-sample c1000' />
      </div>
      <table
        width='100%'
        className='Layer__table Layer__bank-transactions__table'
      >
        <thead>
          <tr>
            <th className='Layer__table-header Layer__bank-transactions__date-col'>
              Date
            </th>
            <th className='Layer__table-header Layer__bank-transactions__tx-col'>
              Transaction
            </th>
            <th className='Layer__table-header Layer__bank-transactions__account-col'>
              Account
            </th>
            <th className='Layer__table-header Layer__table-cell--amount Layer__table-cell__amount-col'>
              Amount
            </th>
            {editable ? (
              <th className='Layer__table-header Layer__table-header--primary Layer__table-cell__category-col'>
                Categorize
              </th>
            ) : (
              <th className='Layer__table-header Layer__table-cell__category-col'>
                Category
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {!isLoading &&
            bankTransactions.map((bankTransaction: BankTransaction) => (
              <BankTransactionRow
                key={bankTransaction.id}
                dateFormat={dateFormat}
                bankTransaction={bankTransaction}
                isOpen={openRows[bankTransaction.id]}
                toggleOpen={toggleOpen}
                editable={editable}
              />
            ))}
        </tbody>
      </table>
      {isLoading || !bankTransactions || bankTransactions?.length === 0 ? (
        <Loader />
      ) : null}
      {!isLoading && (
        <ul className='Layer__bank-transactions__list'>
          {bankTransactions.map((bankTransaction: BankTransaction) => (
            <BankTransactionListItem
              key={bankTransaction.id}
              dateFormat={dateFormat}
              bankTransaction={bankTransaction}
              isOpen={openRows[bankTransaction.id]}
              toggleOpen={toggleOpen}
              editable={editable}
            />
          ))}
        </ul>
      )}
    </Container>
  )
}
