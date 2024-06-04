import React, { useState, useMemo, useEffect } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import { useElementSize } from '../../hooks/useElementSize'
import { DateRange } from '../../types'
import { debounce } from '../../utils/helpers'
import { BankTransactionList } from '../BankTransactionList'
import { BankTransactionMobileList } from '../BankTransactionMobileList'
import { BankTransactionsTable } from '../BankTransactionsTable'
import { Container } from '../Container'
import { Loader } from '../Loader'
import { Pagination } from '../Pagination'
import { BankTransactionsHeader } from './BankTransactionsHeader'
import { DataStates } from './DataStates'
import { DisplayState, MobileComponentType } from './constants'
import { filterVisibility } from './utils'
import { endOfMonth, parseISO, startOfMonth } from 'date-fns'

const COMPONENT_NAME = 'bank-transactions'

export interface BankTransactionsProps {
  asWidget?: boolean
  pageSize?: number
  categorizedOnly?: boolean
  showDescriptions?: boolean
  showReceiptUploads?: boolean
  monthlyView?: boolean
  mobileComponent?: MobileComponentType
}

export const BankTransactions = ({
  asWidget = false,
  pageSize = 15,
  categorizedOnly = false,
  showDescriptions = false,
  showReceiptUploads = false,
  monthlyView = false,
  mobileComponent,
}: BankTransactionsProps) => {
  const [display, setDisplay] = useState<DisplayState>(
    categorizedOnly ? DisplayState.categorized : DisplayState.review,
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [removedTxs, setRemovedTxs] = useState<string[]>([])
  const [initialLoad, setInitialLoad] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  })
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
    if (monthlyView) {
      return bankTransactionsByFilter?.filter(x => parseISO(x.date) >= dateRange.startDate && parseISO(x.date) <= dateRange.endDate)
    }

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
      transparentBg={listView && mobileComponent === 'mobileList'}
      name={COMPONENT_NAME}
      asWidget={asWidget}
      ref={containerRef}
    >
      <BankTransactionsHeader
        shiftStickyHeader={shiftStickyHeader}
        asWidget={asWidget}
        categorizedOnly={categorizedOnly}
        display={display}
        onCategorizationDisplayChange={onCategorizationDisplayChange}
        mobileComponent={mobileComponent}
        withDatePicker={monthlyView}
        listView={listView}
        dateRange={dateRange}
        setDateRange={v => setDateRange(v)}
      />

      {!listView && (
        <BankTransactionsTable
          editable={editable}
          isLoading={isLoading}
          bankTransactions={bankTransactions}
          initialLoad={initialLoad}
          containerWidth={containerWidth}
          removeTransaction={removeTransaction}
          showDescriptions={showDescriptions}
          showReceiptUploads={showReceiptUploads}
        />
      )}

      {isLoading && !bankTransactions ? (
        <div className='Layer__bank-transactions__loader-container'>
          <Loader />
        </div>
      ) : null}

      {!isLoading && listView && mobileComponent !== 'mobileList' ? (
        <BankTransactionList
          bankTransactions={bankTransactions}
          editable={editable}
          removeTransaction={removeTransaction}
          containerWidth={containerWidth}
        />
      ) : null}

      {!isLoading && listView && mobileComponent === 'mobileList' ? (
        <BankTransactionMobileList
          bankTransactions={bankTransactions}
          editable={editable}
          removeTransaction={removeTransaction}
          containerWidth={containerWidth}
          initialLoad={initialLoad}
        />
      ) : null}

      <DataStates
        bankTransactions={bankTransactions}
        isLoading={isLoading}
        isValidating={isValidating}
        error={error}
        refetch={refetch}
      />

      {!monthlyView && (
        <div className='Layer__bank-transactions__pagination'>
          <Pagination
            currentPage={currentPage}
            totalCount={bankTransactionsByFilter?.length || 0}
            pageSize={pageSize}
            onPageChange={page => setCurrentPage(page)}
          />
        </div>
      )}
    </Container>
  )
}
