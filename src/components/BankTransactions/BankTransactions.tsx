import { debounce } from 'lodash'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BREAKPOINTS } from '../../config/general'
import {
  useBankTransactionsContext,
} from '../../contexts/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '../../contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { BankTransactionsProvider } from '../../providers/BankTransactionsProvider/BankTransactionsProvider'
import { BankTransactionFilters, BankTransactionsDateFilterMode } from '../../hooks/useBankTransactions/types'
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
import type { LayerError } from '../../models/ErrorHandler'
import { BookkeepingStatus, useEffectiveBookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '../../utils/bookkeeping/isCategorizationEnabled'
import { LegacyModeProvider, type BankTransactionsMode } from '../../providers/LegacyModeProvider/LegacyModeProvider'
import { BankTransactionTagVisibilityProvider } from '../../features/bankTransactions/[bankTransactionId]/tags/components/BankTransactionTagVisibilityProvider'
import classNames from 'classnames'
import { usePreloadTagDimensions } from '../../features/tags/api/useTagDimensions'
import { BankTransactionCustomerVendorVisibilityProvider } from '../../features/bankTransactions/[bankTransactionId]/customerVendor/components/BankTransactionCustomerVendorVisibilityProvider'
import { usePreloadVendors } from '../../features/vendors/api/useListVendors'
import { usePreloadCustomers } from '../../features/customers/api/useListCustomers'
import { InAppLinkProvider, LinkingMetadata } from '../../contexts/InAppLinkContext'
import { HStack } from '../ui/Stack/Stack'
import { SuggestedCategorizationRuleUpdatesModal } from './SuggestedCategorizationRulesUpdatesModal/SuggestedCategorizationRulesUpdatesModal'
import { SuggestedCategorizationRuleUpdatesDrawer } from '../SuggestedCategorizationRuleUpdates/SuggestedCategorizationRuleUpdatesDrawer'

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

  showCustomerVendor?: boolean
  showDescriptions?: boolean
  showReceiptUploads?: boolean
  showTooltips?: boolean
  showUploadOptions?: boolean
  showStatusToggle?: boolean
  applyGlobalDateRange?: boolean

  monthlyView?: boolean
  categorizeView?: boolean
  mobileComponent?: MobileComponentType
  filters?: BankTransactionFilters
  hideHeader?: boolean
  collapseHeader?: boolean
  stringOverrides?: BankTransactionsStringOverrides
  renderInAppLink?: (details: LinkingMetadata) => ReactNode
}

export interface BankTransactionsWithErrorProps extends BankTransactionsProps {
  onError?: (error: LayerError) => void
  showTags?: boolean
}

export const BankTransactions = ({
  onError,
  showTags = false,
  showCustomerVendor = false,
  monthlyView = false,
  applyGlobalDateRange = false,
  mode,
  renderInAppLink,
  ...props
}: BankTransactionsWithErrorProps) => {
  usePreloadTagDimensions({ isEnabled: showTags })
  usePreloadCustomers({ isEnabled: showCustomerVendor })
  usePreloadVendors({ isEnabled: showCustomerVendor })

  return (
    <ErrorBoundary onError={onError}>
      <BankTransactionsProvider
        monthlyView={monthlyView}
        applyGlobalDateRange={applyGlobalDateRange}
      >
        <LegacyModeProvider overrideMode={mode}>
          <BankTransactionTagVisibilityProvider showTags={showTags}>
            <BankTransactionCustomerVendorVisibilityProvider showCustomerVendor={showCustomerVendor}>
              <InAppLinkProvider renderInAppLink={renderInAppLink}>
                <BankTransactionsContent {...props} />
              </InAppLinkProvider>
            </BankTransactionCustomerVendorVisibilityProvider>
          </BankTransactionTagVisibilityProvider>
        </LegacyModeProvider>
      </BankTransactionsProvider>
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
  showStatusToggle = true,

  categorizeView: categorizeViewProp,
  mobileComponent,
  filters: inputFilters,
  hideHeader = false,
  collapseHeader = false,
  stringOverrides,
}: BankTransactionsProps) => {
  const scrollPaginationRef = useRef<HTMLDivElement>(null)
  const isVisible = useIsVisible(scrollPaginationRef)

  const [currentPage, setCurrentPage] = useState(1)

  const effectiveBookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(effectiveBookkeepingStatus)

  const categorizeView = categorizeViewProp ?? categorizationEnabled

  const {
    data,
    isLoading,
    isError,
    refetch,
    display,
    hasMore,
    fetchMore,
    ruleSuggestion,
    setRuleSuggestion,
    removeAfterCategorize,
  } = useBankTransactionsContext()

  const {
    setFilters,
    filters,
    dateFilterMode,
  } = useBankTransactionsFiltersContext()

  const { data: linkedAccounts } = useLinkedAccounts()

  const isSyncing = useMemo(
    () => Boolean(linkedAccounts?.some(item => item.is_syncing)),
    [linkedAccounts],
  )
  const isMonthlyViewMode = dateFilterMode === BankTransactionsDateFilterMode.MonthlyView

  useEffect(() => {
    // Reset date range when switching from monthly view to non-monthly view
    if (!isMonthlyViewMode && filters?.dateRange) {
      setFilters({ ...filters, dateRange: undefined })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMonthlyViewMode])

  useEffect(() => {
    // Fetch more when the user scrolls to the bottom of the page
    if (isMonthlyViewMode && isVisible && !isLoading && hasMore) {
      fetchMore()
    }
  }, [isMonthlyViewMode, isVisible, isLoading, hasMore, fetchMore])

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputFilters, categorizeView, categorizationEnabled])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleRuleSuggestionOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) setRuleSuggestion(null)
  }, [setRuleSuggestion])

  const rulesSuggestionModal = useMemo(() => {
    if (!ruleSuggestion) return undefined
    return (
      <SuggestedCategorizationRuleUpdatesModal
        isOpen={true}
        ruleSuggestion={ruleSuggestion}
        onOpenChange={handleRuleSuggestionOpenChange}
      />
    )
  }, [ruleSuggestion, handleRuleSuggestionOpenChange])

  const rulesSuggestionDrawer = useMemo(() => {
    if (!ruleSuggestion) return undefined
    return (
      <SuggestedCategorizationRuleUpdatesDrawer
        isOpen={true}
        onOpenChange={handleRuleSuggestionOpenChange}
        ruleSuggestion={ruleSuggestion}
      />
    )
  }, [ruleSuggestion, handleRuleSuggestionOpenChange])

  const bankTransactions = useMemo(() => {
    if (isMonthlyViewMode) return data

    const firstPageIndex = (currentPage - 1) * pageSize
    const lastPageIndex = firstPageIndex + pageSize
    return data?.slice(firstPageIndex, lastPageIndex)
  }, [currentPage, data, isMonthlyViewMode, pageSize])

  const onCategorizationDisplayChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFilters({
      categorizationStatus:
        event.target.value === 'categorized' // see DisplayState enum
          ? DisplayState.categorized
          : event.target.value === 'all' // see DisplayState enum
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
          onCategorizationDisplayChange={onCategorizationDisplayChange}
          mobileComponent={mobileComponent}
          listView={listView}
          stringOverrides={stringOverrides?.bankTransactionsHeader}
          isDataLoading={isLoadingWithoutData}
          isSyncing={isSyncing}
          withUploadMenu={showUploadOptions}
          collapseHeader={collapseHeader}
          showStatusToggle={showStatusToggle}
        />
      )}

      {!listView && (
        <div className='Layer__bank-transactions__table-wrapper'>
          {rulesSuggestionModal}
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
          <div className='Layer__bank-transactions__list-wrapper'>
            {rulesSuggestionModal}
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
          </div>
        )
        : null}

      {!isLoadingWithoutData && listView && mobileComponent === 'mobileList'
        ? (
          <>
            <BankTransactionMobileList
              bankTransactions={bankTransactions}
              editable={editable}
              removeTransaction={removeTransaction}
              showDescriptions={showDescriptions}
              showReceiptUploads={showReceiptUploads}
              showTooltips={showTooltips}
            />
            {rulesSuggestionDrawer}
          </>
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
            isError={isError}
            isFiltered={Boolean(filters?.query)}
            isLoadingWithoutData={isLoadingWithoutData}
          />
        )
        : null}

      {!isMonthlyViewMode && (
        <HStack justify='end'>
          <Pagination
            currentPage={currentPage}
            totalCount={data?.length || 0}
            pageSize={pageSize}
            onPageChange={page => setCurrentPage(page)}
            fetchMore={fetchMore}
            hasMore={hasMore}
          />
        </HStack>
      )}

      {isMonthlyViewMode ? <div ref={scrollPaginationRef} /> : null}
    </Container>
  )
}
