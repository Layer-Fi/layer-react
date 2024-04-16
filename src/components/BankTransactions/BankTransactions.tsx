import React, { useState, useMemo, useEffect } from 'react'
import { DATE_FORMAT } from '../../config/general'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import { useElementSize } from '../../hooks/useElementSize'
import { BankTransaction, CategorizationStatus } from '../../types'
import { debounce } from '../../utils/helpers'
import { BankTransactionListItem } from '../BankTransactionListItem'
import { BankTransactionRow } from '../BankTransactionRow'
import { Container, Header } from '../Container'
import { DataState, DataStateStatus } from '../DataState'
import { Loader } from '../Loader'
import { Pagination } from '../Pagination'
import { Toggle } from '../Toggle'
import { Heading } from '../Typography'

const COMPONENT_NAME = 'bank-transactions'

enum DisplayState {
  review = 'review',
  categorized = 'categorized',
}

const CategorizedCategories = [
  CategorizationStatus.CATEGORIZED,
  CategorizationStatus.JOURNALING,
  CategorizationStatus.SPLIT,
  CategorizationStatus.MATCHED,
]
const ReviewCategories = [
  CategorizationStatus.READY_FOR_INPUT,
  CategorizationStatus.LAYER_REVIEW,
]

export interface BankTransactionsProps {
  asWidget?: boolean
  pageSize?: number
}

const filterVisibility = (
  display: DisplayState,
  bankTransaction: BankTransaction,
) => {
  const categorized = CategorizedCategories.includes(
    bankTransaction.categorization_status,
  )
  const inReview =
    ReviewCategories.includes(bankTransaction.categorization_status) &&
    !bankTransaction.recently_categorized

  return (
    (display === DisplayState.review && inReview) ||
    (display === DisplayState.categorized && categorized)
  )
}

export const BankTransactions = ({
  asWidget = false,
  pageSize = 15,
}: BankTransactionsProps) => {
  const [display, setDisplay] = useState<DisplayState>(DisplayState.review)
  const [currentPage, setCurrentPage] = useState(1)
  const [removedTxs, setRemovedTxs] = useState<string[]>([])
  const [initialLoad, setInitialLoad] = useState(true)
  const { data, isLoading, error, isValidating, refetch } =
    useBankTransactions()

  const bankTransactionsByFilter = data?.filter(
    tx => !removedTxs.includes(tx.id) && filterVisibility(display, tx),
  )

  useEffect(() => {
    if (!isLoading) {
      const timeoutLoad = setTimeout(() => {
        setInitialLoad(false)
      }, 1000)
      return () => clearTimeout(timeoutLoad)
    }
  }, [isLoading])

  const bankTransactions = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return bankTransactionsByFilter?.slice(firstPageIndex, lastPageIndex)
  }, [currentPage, bankTransactionsByFilter, removedTxs])

  const onCategorizationDisplayChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setDisplay(
      event.target.value === DisplayState.categorized
        ? DisplayState.categorized
        : DisplayState.review,
    )
    setCurrentPage(1)
  }

  const [shiftStickyHeader, setShiftStickyHeader] = useState(0)
  const debounceShiftStickyHeader = debounce(setShiftStickyHeader, 500)
  const [listView, setListView] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const debounceContainerWidth = debounce(setContainerWidth, 500)

  const removeTransaction = (id: string) => {
    const newTxs = removedTxs.slice()
    newTxs.push(id)
    setRemovedTxs(newTxs)
  }

  const containerRef = useElementSize<HTMLDivElement>((_el, _en, size) => {
    if (size?.height && size?.height >= 90) {
      const newShift = -Math.floor(size.height / 2) + 6
      if (newShift !== shiftStickyHeader) {
        debounceShiftStickyHeader(newShift)
      }
    } else if (size?.height > 0 && shiftStickyHeader !== 0) {
      debounceShiftStickyHeader(0)
    }

    if (size.width > 700 && listView) {
      setListView(false)
    } else if (size.width <= 700 && !listView) {
      setListView(true)
    }

    debounceContainerWidth(size?.width)
  })

  const editable = display === DisplayState.review
  return (
    <Container
      className={
        editable
          ? 'Layer__bank-transactions--to-review'
          : 'Layer__bank-transactions--categorized'
      }
      name={COMPONENT_NAME}
      asWidget={asWidget}
      ref={containerRef}
    >
      <Header
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
      {!listView && (
        <table
          width='100%'
          className='Layer__table Layer__bank-transactions__table with-cell-separators'
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
              bankTransactions?.map(
                (bankTransaction: BankTransaction, index: number) => (
                  <BankTransactionRow
                    initialLoad={initialLoad}
                    index={index}
                    key={bankTransaction.id}
                    dateFormat={DATE_FORMAT}
                    bankTransaction={bankTransaction}
                    editable={editable}
                    removeTransaction={removeTransaction}
                    containerWidth={containerWidth}
                  />
                ),
              )}
          </tbody>
        </table>
      )}

      {isLoading && !bankTransactions ? (
        <div className='Layer__bank-transactions__loader-container'>
          <Loader />
        </div>
      ) : null}

      {!isLoading && listView ? (
        <ul className='Layer__bank-transactions__list'>
          {bankTransactions?.map(
            (bankTransaction: BankTransaction, index: number) => (
              <BankTransactionListItem
                index={index}
                key={bankTransaction.id}
                dateFormat={DATE_FORMAT}
                bankTransaction={bankTransaction}
                editable={editable}
                removeTransaction={removeTransaction}
                containerWidth={containerWidth}
              />
            ),
          )}
        </ul>
      ) : null}

      {!isLoading &&
      !error &&
      (bankTransactions === undefined ||
        (bankTransactions !== undefined && bankTransactions.length === 0)) ? (
        <div className='Layer__table-state-container'>
          <DataState
            status={DataStateStatus.allDone}
            title='You are up to date with transactions!'
            description='All uncategorized transaction will be displayed here'
            onRefresh={() => refetch()}
            isLoading={isValidating}
          />
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className='Layer__table-state-container'>
          <DataState
            status={DataStateStatus.failed}
            title='Something went wrong'
            description='We couldn’t load your data.'
            onRefresh={() => refetch()}
            isLoading={isValidating}
          />
        </div>
      ) : null}

      <div className='Layer__bank-transactions__pagination'>
        <Pagination
          currentPage={currentPage}
          totalCount={bankTransactionsByFilter?.length || 0}
          pageSize={pageSize}
          onPageChange={page => setCurrentPage(page)}
        />
      </div>
    </Container>
  )
}
