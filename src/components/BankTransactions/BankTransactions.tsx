import React, { useState, useMemo, useEffect } from 'react'
import { BREAKPOINTS } from '../../config/general'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import {
  BankTransactionFilters,
  DisplayState,
} from '../../hooks/useBankTransactions/types'
import { useElementSize } from '../../hooks/useElementSize'
import { CategorizationScope, DateRange } from '../../types'
import { debounce } from '../../utils/helpers'
import { BankTransactionList } from '../BankTransactionList'
import { BankTransactionMobileList } from '../BankTransactionMobileList'
import { BankTransactionsTable } from '../BankTransactionsTable'
import { Container } from '../Container'
import { Loader } from '../Loader'
import { Pagination } from '../Pagination'
import { BankTransactionsHeader } from './BankTransactionsHeader'
import { DataStates } from './DataStates'
import { MobileComponentType } from './constants'
import { endOfMonth, parseISO, startOfMonth } from 'date-fns'

const COMPONENT_NAME = 'bank-transactions'

export interface BankTransactionsProps {
  asWidget?: boolean
  pageSize?: number
  categorizedOnly?: boolean
  showDescriptions?: boolean
  showReceiptUploads?: boolean
  monthlyView?: boolean
  categorizeView?: boolean
  mobileComponent?: MobileComponentType
  filters?: BankTransactionFilters
  hideHeader?: boolean
}

export const BankTransactions = ({
  asWidget = false,
  pageSize = 15,
  categorizedOnly = false,
  categorizeView = true,
  showDescriptions = false,
  showReceiptUploads = false,
  monthlyView = false,
  mobileComponent,
  filters: inputFilters,
  hideHeader = false,
}: BankTransactionsProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [removedTxs, setRemovedTxs] = useState<string[]>([])
  const [initialLoad, setInitialLoad] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  })
  const {
    activate,
    data,
    isLoading,
    loadingStatus,
    error,
    isValidating,
    refetch,
    setFilters,
    filters,
    accountsList,
    display,
  } = useBankTransactionsContext()

  useEffect(() => {
    activate()
  }, [])

  useEffect(() => {
    if (JSON.stringify(inputFilters) !== JSON.stringify(filters)) {
      if (!filters?.categorizationStatus && categorizeView) {
        setFilters({
          ...filters,
          ...inputFilters,
          categorizationStatus: CategorizationScope.TO_REVIEW,
        })
      } else if (!filters?.categorizationStatus && categorizedOnly) {
        setFilters({
          ...filters,
          ...inputFilters,
          categorizationStatus: CategorizationScope.CATEGORIZED,
        })
      } else {
        setFilters({ ...filters, ...inputFilters })
      }
    } else if (!filters?.categorizationStatus && categorizeView) {
      setFilters({
        categorizationStatus: CategorizationScope.TO_REVIEW,
      })
    } else if (!filters?.categorizationStatus && categorizedOnly) {
      setFilters({
        categorizationStatus: CategorizationScope.CATEGORIZED,
      })
    }
  }, [inputFilters, categorizeView, categorizedOnly])

  useEffect(() => {
    if (loadingStatus === 'complete') {
      const timeoutLoad = setTimeout(() => {
        setInitialLoad(false)
      }, 1000)
      return () => clearTimeout(timeoutLoad)
    }
  }, [loadingStatus])

  const bankTransactions = useMemo(() => {
    if (monthlyView) {
      return data?.filter(
        x =>
          parseISO(x.date) >= dateRange.startDate &&
          parseISO(x.date) <= dateRange.endDate,
      )
    }

    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return data?.slice(firstPageIndex, lastPageIndex)
  }, [currentPage, data, removedTxs, dateRange])

  const onCategorizationDisplayChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFilters({
      categorizationStatus:
        event.target.value === DisplayState.categorized
          ? CategorizationScope.CATEGORIZED
          : CategorizationScope.TO_REVIEW,
    })
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

    if (size.width > BREAKPOINTS.TABLET && listView) {
      setListView(false)
    } else if (size.width <= BREAKPOINTS.TABLET && !listView) {
      setListView(true)
    }

    debounceContainerWidth(size?.width)
  })

  const editable = display === DisplayState.review
  return (
    <Container
      className={
        display === DisplayState.review
          ? 'Layer__bank-transactions--to-review'
          : 'Layer__bank-transactions--categorized'
      }
      transparentBg={listView && mobileComponent === 'mobileList'}
      name={COMPONENT_NAME}
      asWidget={asWidget}
      ref={containerRef}
    >
      {!hideHeader && (
        <BankTransactionsHeader
          shiftStickyHeader={shiftStickyHeader}
          asWidget={asWidget}
          categorizedOnly={categorizedOnly}
          categorizeView={categorizeView}
          display={display}
          onCategorizationDisplayChange={onCategorizationDisplayChange}
          mobileComponent={mobileComponent}
          withDatePicker={monthlyView}
          listView={listView}
          dateRange={dateRange}
          setDateRange={v => setDateRange(v)}
        />
      )}

      {!listView && (
        <BankTransactionsTable
          categorizeView={categorizeView}
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
          initialLoad={initialLoad}
        />
      ) : null}

      <DataStates
        bankTransactions={bankTransactions}
        isLoading={isLoading}
        isValidating={isValidating}
        error={error}
        refetch={refetch}
        editable={editable}
      />

      {!monthlyView && (
        <div className='Layer__bank-transactions__pagination'>
          <Pagination
            currentPage={currentPage}
            totalCount={data?.length || 0}
            pageSize={pageSize}
            onPageChange={page => setCurrentPage(page)}
          />
        </div>
      )}
    </Container>
  )
}
