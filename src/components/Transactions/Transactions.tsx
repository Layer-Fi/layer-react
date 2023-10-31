import React, { useState, useContext } from 'react'
import { LayerContext } from '../../contexts/LayerContext'
import './Transactions.css'
import { parseISO, format as formatTime } from 'date-fns'
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

const formatMoney = ({ amount, direction }) =>
  (direction === 'CREDIT' ? '+' : '-') +
  Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    amount,
  )

const transactionRow = transaction => (
  <>
    <div>
      <input type="checkbox" />
    </div>
    <div>{formatTime(parseISO(transaction.date), dateFormat)}</div>
    <div>{formatMoney(transaction)}</div>
    <div>Business Checking</div>
    <div>{transaction.counterparty_name}</div>
    <div>{transaction?.category?.display_name || 'Uncategorized'}</div>
    <div>&#x2304;</div>
  </>
)

type Props = {}

export const Transactions = (props: Props) => {
  const { auth, businessId } = useContext(LayerContext)
  const { data, isLoading } = useSWR(
    auth?.access_token &&
      `https://sandbox.layerfi.com/v1/businesses/${businessId}/bank-transactions`,
    fetchTransactions(auth?.access_token),
  )
  const transactions = (!isLoading && data?.data) || []
  const [display, setDisplay] = useState<'review' | 'categorized'>('review')
  const changeDisplay = (event: React.ChangeEvent<HTMLInputElement>) =>
    setDisplay(event.currentTarget.value)
  return (
    <div className="transactions" data-display={display}>
      <header>
        <h1>Transactions</h1>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="transaction-display"
              value="review"
              {...(display === 'review' ? { checked: 'checked' } : {})}
              onChange={changeDisplay}
            />
            <div>To Review</div>
          </label>
          <label>
            <input
              type="radio"
              name="transaction-display"
              value="categorized"
              {...(display === 'categorized' ? { checked: 'checked' } : {})}
              onChange={changeDisplay}
            />
            <div>Categorized</div>
          </label>
        </div>
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
        {transactions.map(transactionRow)}
      </div>
    </div>
  )
}
