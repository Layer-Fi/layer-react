import { debounce } from 'lodash'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BREAKPOINTS } from '../../config/general'
import {
  BankTransactionsContext,
  useBankTransactionsContext,
} from '../../contexts/BankTransactionsContext'
import { useAugmentedBankTransactions } from '../../hooks/useBankTransactions/useAugmentedBankTransactions'
import { BankTransactionFilters } from '../../hooks/useBankTransactions/types'
import { useElementSize } from '../../hooks/useElementSize'
import { useIsVisible } from '../../hooks/useIsVisible'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'
import { BankTransaction, DisplayState } from '../../types'
import { BankTransactionList } from '../BankTransactionList'
import { BankTransactionMobileList } from '../BankTransactionMobileList/BankTransactionMobileList'
import {
  BankTransactionsTable,
  type BankTransactionsTableStringOverrides,
} from '../BankTransactionsTable/BankTransactionsTable'
import { Container } from '../Container'
import { ErrorBoundary } from '../ErrorBoundary'
import { Loader } from '../Loader'
import { Pagination } from '../Pagination'
import {
  BankTransactionsHeader,
  BankTransactionsHeaderStringOverrides,
} from './BankTransactionsHeader'
import { BankTransactionsTableEmptyStates } from './BankTransactionsTableEmptyState'
import { MobileComponentType } from './constants'
import { endOfMonth, startOfMonth } from 'date-fns'
import type { LayerError } from '../../models/ErrorHandler'
import { BookkeepingStatus, useEffectiveBookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '../../utils/bookkeeping/isCategorizationEnabled'
import { LegacyModeProvider, type BankTransactionsMode } from '../../providers/LegacyModeProvider/LegacyModeProvider'
import { BankTransactionTagVisibilityProvider } from '../../features/bankTransactions/[bankTransactionId]/tags/components/BankTransactionTagVisibilityProvider'
import classNames from 'classnames'
import { usePreloadTagDimensions } from '../../features/tags/api/useTagDimensions'
import { BankTransactionSecondPartyVisibilityProvider } from '../../features/bankTransactions/[bankTransactionId]/secondParty/components/BankTransactionSecondPartyVisibilityProvider'

const COMPONENT_NAME = 'bank-transactions'

export interface BankTransactionsStringOverrides {
  bankTransactionCTAs?: BankTransactionCTAStringOverrides
  transactionsTable?: BankTransactionsTableStringOverrides
  bankTransactionsHeader?: BankTransactionsHeaderStringOverrides
}

export interface BankTransactionCTAStringOverrides {
  approveButtonText?: string
  updateButtonText?: string
}

export interface BankTransactionsProps {
  asWidget?: boolean
  pageSize?: number
  /**
   * @deprecated `mode` can be inferred from the bookkeeping configuration of a business
   */
  mode?: BankTransactionsMode

  showDescriptions?: boolean
  showReceiptUploads?: boolean
  showTooltips?: boolean
  showUploadOptions?: boolean

  monthlyView?: boolean
  categorizeView?: boolean
  mobileComponent?: MobileComponentType
  filters?: BankTransactionFilters
  hideHeader?: boolean
  stringOverrides?: BankTransactionsStringOverrides
}

export interface BankTransactionsWithErrorProps extends BankTransactionsProps {
  onError?: (error: LayerError) => void
  showTags?: boolean
  showSecondParty?: boolean
}

export const BankTransactions = ({
  onError,
  showTags = false,
  showSecondParty = false,
  mode,
  ...props
}: BankTransactionsWithErrorProps) => {
  usePreloadTagDimensions({ isEnabled: showTags })

  const contextData = useAugmentedBankTransactions({ monthlyView: props.monthlyView })

  return (
    <ErrorBoundary onError={onError}>
      <BankTransactionsContext.Provider value={contextData}>
        <LegacyModeProvider overrideMode={mode}>
          <BankTransactionTagVisibilityProvider showTags={showTags}>
            <BankTransactionSecondPartyVisibilityProvider showSecondParty={showSecondParty}>
              <BankTransactionsContent {...props} />
            </BankTransactionSecondPartyVisibilityProvider>
          </BankTransactionTagVisibilityProvider>
        </LegacyModeProvider>
      </BankTransactionsContext.Provider>
    </ErrorBoundary>
  )
}

const BankTransactionsContent = ({
  asWidget = false,
  pageSize = 20,

  showDescriptions = true,
  showReceiptUploads = true,
  showTooltips = false,
  showUploadOptions = false,

  monthlyView = false,
  categorizeView: categorizeViewProp,
  mobileComponent,
  filters: inputFilters,
  hideHeader = false,
  stringOverrides,
}: BankTransactionsProps) => {
  const [defaultDateRange] = useState(() => ({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  }))

  const scrollPaginationRef = useRef<HTMLDivElement>(null)
  const isVisible = useIsVisible(scrollPaginationRef)

  const [currentPage, setCurrentPage] = useState(1)

  const effectiveBookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(effectiveBookkeepingStatus)

  const categorizeView = categorizeViewProp ?? categorizationEnabled

  const {
    data,
    isLoading,
    error,
    refetch,
    setFilters,
    filters,
    display,
    hasMore,
    fetchMore,
    removeAfterCategorize,
  } = useBankTransactionsContext()

  const { data: linkedAccounts } = useLinkedAccounts()

  const isSyncing = useMemo(
    () => Boolean(linkedAccounts?.some(item => item.is_syncing)),
    [linkedAccounts],
  )

  useEffect(() => {
    // Reset date range when switching from monthly view to non-monthly view
    if (!monthlyView && filters?.dateRange) {
      setFilters({ ...filters, dateRange: undefined })
    }
  }, [monthlyView])

  useEffect(() => {
    // Fetch more when the user scrolls to the bottom of the page
    if (monthlyView && isVisible && !isLoading && hasMore) {
      fetchMore()
    }
  }, [monthlyView, isVisible, isLoading, hasMore])

  useEffect(() => {
    if (JSON.stringify(inputFilters) !== JSON.stringify(filters)) {
      if (effectiveBookkeepingStatus === BookkeepingStatus.ACTIVE) {
        setFilters({
          ...filters,
          ...inputFilters,
          categorizationStatus: DisplayState.all,
        })
      }
      else if (!inputFilters?.categorizationStatus && categorizeView) {
        setFilters({
          ...filters,
          ...inputFilters,
          categorizationStatus: DisplayState.review,
        })
      }
      else if (
        !inputFilters?.categorizationStatus
        && !categorizationEnabled
      ) {
        setFilters({
          ...filters,
          ...inputFilters,
          categorizationStatus: DisplayState.categorized,
        })
      }
      else {
        setFilters({ ...filters, ...inputFilters })
      }
    }
    else if (!inputFilters?.categorizationStatus && categorizeView) {
      setFilters({
        categorizationStatus: DisplayState.review,
      })
    }
    else if (
      !inputFilters?.categorizationStatus
      && !categorizationEnabled
    ) {
      setFilters({
        categorizationStatus: DisplayState.categorized,
      })
    }
  }, [inputFilters, categorizeView, categorizationEnabled])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const bankTransactions = useMemo(() => {
    if (monthlyView) {
      return data
    }

    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return data?.slice(firstPageIndex, lastPageIndex)
  }, [currentPage, data, monthlyView, pageSize])

  const onCategorizationDisplayChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFilters({
      categorizationStatus:
        event.target.value === DisplayState.categorized
          ? DisplayState.categorized
          : event.target.value === DisplayState.all
            ? DisplayState.all
            : DisplayState.review,
    })
    setCurrentPage(1)
  }

  const [shiftStickyHeader, setShiftStickyHeader] = useState(0)
  const debounceShiftStickyHeader = debounce(setShiftStickyHeader, 500)
  const [listView, setListView] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const debounceContainerWidth = debounce(setContainerWidth, 500)

  const removeTransaction = (bankTransaction: BankTransaction) =>
    removeAfterCategorize(bankTransaction)

  const containerRef = useElementSize<HTMLDivElement>((_el, _en, size) => {
    if (size?.height && size?.height >= 90) {
      const newShift = -Math.floor(size.height / 2) + 6
      if (newShift !== shiftStickyHeader) {
        void debounceShiftStickyHeader(newShift)
      }
    }
    else if (size?.height > 0 && shiftStickyHeader !== 0) {
      void debounceShiftStickyHeader(0)
    }

    if (size.width > BREAKPOINTS.TABLET && listView) {
      setListView(false)
    }
    else if (size.width <= BREAKPOINTS.TABLET && !listView) {
      setListView(true)
    }

    void debounceContainerWidth(size?.width)
  })

  const editable =
    display === DisplayState.review || display === DisplayState.all

  const isLastPage =
    data
    && !hasMore
    && Math.ceil((data?.length || 0) / pageSize) === currentPage

  const isLoadingWithoutData = isLoading && !data

  return (
    <Container
      className={
        classNames(
          'Layer__Public',
          display === DisplayState.review
            ? 'Layer__bank-transactions--to-review'
            : 'Layer__bank-transactions--categorized',
        )
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
          categorizedOnly={!categorizationEnabled}
          categorizeView={categorizeView}
          display={display}
          onCategorizationDisplayChange={onCategorizationDisplayChange}
          mobileComponent={mobileComponent}
          withDatePicker={monthlyView}
          listView={listView}
          dateRange={{ ...defaultDateRange, ...filters?.dateRange }}
          setDateRange={(v) => {
            if (monthlyView) {
              setFilters({ ...filters, dateRange: v })
            }
          }}
          stringOverrides={stringOverrides?.bankTransactionsHeader}
          isDataLoading={isLoadingWithoutData}
          isSyncing={isSyncing}
          withUploadMenu={showUploadOptions}
        />
      )}

      {!listView && (
        <div className='Layer__bank-transactions__table-wrapper'>
          <BankTransactionsTable
            categorizeView={categorizeView}
            editable={editable}
            isLoading={isLoadingWithoutData}
            isSyncing={isSyncing}
            bankTransactions={bankTransactions}
            containerWidth={containerWidth}
            removeTransaction={removeTransaction}
            page={currentPage}
            stringOverrides={stringOverrides}
            lastPage={isLastPage}
            onRefresh={refetch}

            showDescriptions={showDescriptions}
            showReceiptUploads={showReceiptUploads}
            showTooltips={showTooltips}
          />
        </div>
      )}

      {!isLoadingWithoutData && listView && mobileComponent !== 'mobileList'
        ? (
          <BankTransactionList
            bankTransactions={bankTransactions}
            editable={editable}
            removeTransaction={removeTransaction}
            containerWidth={containerWidth}
            stringOverrides={stringOverrides?.bankTransactionCTAs}

            showDescriptions={showDescriptions}
            showReceiptUploads={showReceiptUploads}
            showTooltips={showTooltips}
          />
        )
        : null}

      {!isLoadingWithoutData && listView && mobileComponent === 'mobileList'
        ? (
          <BankTransactionMobileList
            bankTransactions={bankTransactions}
            editable={editable}
            removeTransaction={removeTransaction}

            showDescriptions={showDescriptions}
            showReceiptUploads={showReceiptUploads}
            showTooltips={showTooltips}
          />
        )
        : null}

      {listView && isLoadingWithoutData
        ? (
          <div className='Layer__bank-transactions__list-loader'>
            <Loader />
          </div>
        )
        : null}

      {!isSyncing || listView
        ? (
          <BankTransactionsTableEmptyStates
            hasVisibleTransactions={(bankTransactions?.length ?? 0) > 0}
            isCategorizationMode={editable}
            isError={Boolean(error)}
            isFiltered={Boolean(filters?.descriptionFilter)}
            isLoadingWithoutData={isLoadingWithoutData}
          />
        )
        : null}

      {!monthlyView && (
        <Pagination
          currentPage={currentPage}
          totalCount={data?.length || 0}
          pageSize={pageSize}
          onPageChange={page => setCurrentPage(page)}
          fetchMore={fetchMore}
          hasMore={hasMore}
        />
      )}

      {monthlyView ? <div ref={scrollPaginationRef} /> : null}
    </Container>
  )
}
