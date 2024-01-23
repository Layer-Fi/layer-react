import React, { useState } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import { BankTransaction, CategorizationStatus } from '../../types'
import { BankTransactionRow } from '../BankTransactionRow'
import { Container, Header } from '../Container'
import { RadioButtonGroup } from '../RadioButtonGroup'
import { Heading } from '../Typography'

const COMPONENT_NAME = 'bank-transactions'

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
    <Container name={COMPONENT_NAME}>
      <Header className='Layer__bank-transactions__header'>
        <Heading className='Layer__bank-transactions__title'>
          Transactions
        </Heading>
        <RadioButtonGroup
          name='bank-transaction-display'
          buttons={[
            { label: 'To Review', value: DisplayState.review },
            { label: 'Categorized', value: DisplayState.categorized },
          ]}
          selected={display}
          onChange={onCategorizationDisplayChange}
        />
      </Header>
      <table className='Layer__table Layer__bank-transactions__table'>
        <thead>
          <tr>
            <th className='Layer__table-header'>Date</th>
            <th className='Layer__table-header'>Transaction</th>
            <th className='Layer__table-header'>Account</th>
            <th className='Layer__table-header Layer__table-cell--amount'>
              Amount
            </th>
            <th className='Layer__table-header Layer__table-header--primary'>
              Categorize
            </th>
          </tr>
        </thead>
        <tbody>
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
        </tbody>
      </table>
    </Container>
  )
}
