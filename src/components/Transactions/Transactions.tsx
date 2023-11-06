import React, { useState, useContext } from 'react'
import { LayerContext } from '../../contexts/LayerContext'
import { Transaction, CategorizationStatus } from '../../types'
import { RadioButtonGroup } from '../RadioButtonGroup'
import { TransactionRow } from './TransactionRow'
import './Transactions.css'
import useSWR from 'swr'

const dateFormat = 'MM/dd/yyyy'

const fetchTransactions = (accessToken: string) => (url: string) =>
  fetch(url, {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
    },
    method: 'GET',
  }).then(res => res.json())

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

type Props = {}

export const Transactions = (props: Props) => {
  const { auth, businessId } = useContext(LayerContext)
  const [display, setDisplay] = useState<'review' | 'categorized'>('review')
  const { data, isLoading } = useSWR(
    auth?.access_token &&
      `https://sandbox.layerfi.com/v1/businesses/${businessId}/bank-transactions`,
    fetchTransactions(auth?.access_token),
  )
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
            { label: 'To Review', value: 'review' },
            { label: 'Categorized', value: 'categorized' },
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
