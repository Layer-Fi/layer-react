import { debounce } from 'lodash'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BREAKPOINTS } from '../../config/general'
import {
  BankTransactionsContext,
  BankTransactionsBulkSelectionContext,
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
import { useBankTransactionsBulkSelection } from '../../hooks/useBankTransactionsBulkSelection'
// Temporarily commented out - these files don't exist in the current codebase
// import { BankTransactionTagVisibilityProvider } from '../../features/bankTransactions/[bankTransactionId]/tags/components/BankTransactionTagVisibilityProvider'
// import { BankTransactionCustomerVendorVisibilityProvider } from '../../features/bankTransactions/[bankTransactionId]/customerVendor/components/BankTransactionCustomerVendorVisibilityProvider'
// import { usePreloadTagDimensions } from '../../features/tags/api/useTagDimensions'
// import { usePreloadCustomers } from '../../features/customers/api/useListCustomers'
// import { usePreloadVendors } from '../../features/vendors/api/useListVendors'
import { Modal } from '../ui/Modal/Modal'
import { ModalHeading, ModalActions, ModalDescription, ModalTitleWithClose } from '../ui/Modal/ModalSlots'
import { Button, ButtonVariant } from '../Button'
import { HStack, Spacer } from '../ui/Stack/Stack'
import classNames from 'classnames'
import { CategorySelect, CategoryOption } from '../CategorySelect/CategorySelect'
import { VStack } from '../ui/Stack/Stack'
import { Text, TextSize, TextWeight } from '../Typography'

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
}

export const BankTransactions = ({
  onError,
  showTags = false,
  showCustomerVendor = false,
  mode,
  ...props
}: BankTransactionsWithErrorProps) => {
  // usePreloadTagDimensions({ isEnabled: showTags })
  // usePreloadCustomers({ isEnabled: showCustomerVendor })
  // usePreloadVendors({ isEnabled: showCustomerVendor })

  const contextData = useAugmentedBankTransactions({ monthlyView: props.monthlyView })

  return (
    <ErrorBoundary onError={onError}>
      <BankTransactionsContext.Provider value={contextData}>
        <LegacyModeProvider overrideMode={mode}>
          {/* <BankTransactionTagVisibilityProvider showTags={showTags}> */}
          {/* <BankTransactionCustomerVendorVisibilityProvider showCustomerVendor={showCustomerVendor}> */}
          <BankTransactionsContent {...props} />
          {/* </BankTransactionCustomerVendorVisibilityProvider> */}
          {/* </BankTransactionTagVisibilityProvider> */}
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

  const bulkSelection = useBankTransactionsBulkSelection()
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false)
  const [selectedBulkCategory, setSelectedBulkCategory] = useState<CategoryOption | undefined>(undefined)

  const handleBulkActionClick = () => {
    setIsBulkActionModalOpen(true)
  }

  const handleBulkActionModalClose = () => {
    setIsBulkActionModalOpen(false)
    setSelectedBulkCategory(undefined)
  }

  const handleBulkCategorization = () => {
    if (!selectedBulkCategory) {
      console.log('No category selected for bulk action')
      return
    }

    const selectedTransactionIds = bulkSelection.selectedTransactions.map(tx => tx.id)
    
    console.log('Bulk categorization:', {
      transactionIds: selectedTransactionIds,
      transactionCount: selectedTransactionIds.length,
      category: {
        id: selectedBulkCategory.payload.id,
        name: selectedBulkCategory.payload.display_name,
        type: selectedBulkCategory.payload.type
      },
      affectedTransactions: bulkSelection.selectedTransactions.map(tx => ({
        id: tx.id,
        description: tx.description,
        amount: tx.amount,
        date: tx.date
      }))
    })

    // TODO: Replace with actual API call
    // For now, just close the modal and clear selections
    handleBulkActionModalClose()
    bulkSelection.clearSelection()
  }

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

  // Aggregate suggestions from selected transactions
  const aggregatedSuggestions = useMemo(() => {
    const suggestionCounts = new Map<string, { category: any, count: number }>()
    
    // Helper function to generate unique key for categories
    const getCategoryKey = (category: any) => {
      if (category.type === 'AccountNested' || category.type === 'ExclusionNested') {
        return `${category.type}-${category.id}`
      } else if (category.type === 'OptionalAccountNested') {
        return `${category.type}-${category.stable_name}`
      }
      return `${category.type}-${category.display_name}`
    }
    
    // Use selected transactions to get relevant suggestions
    bulkSelection.selectedTransactions.forEach(transaction => {
      if (transaction.categorization_flow?.type === 'ASK_FROM_SUGGESTIONS') {
        transaction.categorization_flow.suggestions.forEach(suggestion => {
          const key = getCategoryKey(suggestion)
          const existing = suggestionCounts.get(key)
          
          if (existing) {
            existing.count += 1
          } else {
            suggestionCounts.set(key, { category: suggestion, count: 1 })
          }
        })
      }
    })
    
    // Sort by count (descending) and take top 5
    return Array.from(suggestionCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => item.category)
  }, [bulkSelection.selectedTransactions])

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
    <BankTransactionsBulkSelectionContext.Provider value={bulkSelection}>
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
          onBulkActionClick={handleBulkActionClick}
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
            isFiltered={Boolean(filters?.query)}
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

      <Modal 
        isOpen={isBulkActionModalOpen} 
        size='lg'
        onOpenChange={(isOpen) => {
          // Prevent closing when clicking outside
          // Modal can only be closed programmatically via the X button
        }}
      >
        {({ close }) => (
          <>
            <ModalTitleWithClose
              heading={
                <ModalHeading size='lg'>
                  Bulk Actions
                </ModalHeading>
              }
              onClose={() => {
                handleBulkActionModalClose()
              }}
            />
            <VStack gap='md'>
              <ModalDescription>
                You have {bulkSelection.selectedTransactions.length} transactions selected. Choose an action to perform on all selected transactions.
              </ModalDescription>
              
              <VStack gap='sm'>
                <Text size={TextSize.md} weight={TextWeight.bold}>
                  Categorize All Selected Transactions
                </Text>
                <Text size={TextSize.sm}>
                  Apply the same category to all {bulkSelection.selectedTransactions.length} selected transactions.
                </Text>
                
                <div style={{ width: '100%' }}>
                  <CategorySelect
                    value={selectedBulkCategory}
                    onChange={setSelectedBulkCategory}
                    showTooltips={showTooltips}
                    excludeMatches={true}
                    className="Layer__bulk-category-select"
                    externalSuggestions={aggregatedSuggestions}
                  />
                </div>
              </VStack>
            </VStack>
            
            <ModalActions>
              <HStack gap='sm' justify='end'>
                <Button
                  variant={ButtonVariant.secondary}
                  onClick={handleBulkActionModalClose}
                >
                  Cancel
                </Button>
                <Button
                  variant={ButtonVariant.primary}
                  onClick={handleBulkCategorization}
                  disabled={!selectedBulkCategory}
                >
                  Categorize {bulkSelection.selectedTransactions.length} Transactions
                </Button>
              </HStack>
            </ModalActions>
          </>
        )}
      </Modal>
    </Container>
    </BankTransactionsBulkSelectionContext.Provider>
  )
}
