import { type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { debounce } from 'lodash-es'

import { type BankTransaction, DisplayState } from '@internal-types/bank_transactions'
import type { LayerError } from '@models/ErrorHandler'
import { BREAKPOINTS } from '@config/general'
import { usePreloadCategories } from '@hooks/categories/useCategories'
import { type BankTransactionFilters, BankTransactionsDateFilterMode } from '@hooks/useBankTransactions/types'
import { useElementSize } from '@hooks/useElementSize/useElementSize'
import { useIsVisible } from '@hooks/useIsVisible/useIsVisible'
import { useLinkedAccounts } from '@hooks/useLinkedAccounts/useLinkedAccounts'
import { BankTransactionsCategoryStoreProvider } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { BankTransactionsProvider } from '@providers/BankTransactionsProvider/BankTransactionsProvider'
import { BankTransactionsRoute, BankTransactionsRouteStoreProvider, useBankTransactionsRouteState, useCurrentBankTransactionsPage } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { BulkSelectionStoreProvider } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { type BankTransactionsMode, LegacyModeProvider } from '@providers/LegacyModeProvider/LegacyModeProvider'
import {
  useBankTransactionsContext,
} from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { BankTransactionsIsCategorizationEnabledProvider } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { CategorizationRulesContext, CategorizationRulesProvider } from '@contexts/CategorizationRulesContext/CategorizationRulesContext'
import { InAppLinkProvider, type LinkingMetadata } from '@contexts/InAppLinkContext'
import { HStack } from '@ui/Stack/Stack'
import {
  BankTransactionsHeader,
  type BankTransactionsHeaderStringOverrides,
} from '@components/BankTransactions/BankTransactionsHeader'
import { BankTransactionsTableEmptyStates } from '@components/BankTransactions/BankTransactionsTableEmptyState'
import { type MobileComponentType } from '@components/BankTransactions/constants'
import { SuggestedCategorizationRuleUpdatesModal } from '@components/BankTransactions/SuggestedCategorizationRulesUpdatesModal/SuggestedCategorizationRulesUpdatesModal'
import { BankTransactionsList } from '@components/BankTransactionsList/BankTransactionsList'
import { BankTransactionsMobileList } from '@components/BankTransactionsMobileList/BankTransactionsMobileList'
import {
  BankTransactionsTable,
  type BankTransactionsTableStringOverrides,
} from '@components/BankTransactionsTable/BankTransactionsTable'
import { CategorizationRulesDrawer } from '@components/CategorizationRules/CategorizationRulesDrawer'
import { Container } from '@components/Container/Container'
import { ErrorBoundary } from '@components/ErrorBoundary/ErrorBoundary'
import { Loader } from '@components/Loader/Loader'
import { Pagination } from '@components/Pagination/Pagination'
import { SuggestedCategorizationRuleUpdatesDrawer } from '@components/SuggestedCategorizationRuleUpdates/SuggestedCategorizationRuleUpdatesDrawer'
import { BankTransactionCustomerVendorVisibilityProvider } from '@features/bankTransactions/[bankTransactionId]/customerVendor/components/BankTransactionCustomerVendorVisibilityProvider'
import { BankTransactionTagVisibilityProvider } from '@features/bankTransactions/[bankTransactionId]/tags/components/BankTransactionTagVisibilityProvider'
import { usePreloadCustomers } from '@features/customers/api/useListCustomers'
import { usePreloadTagDimensions } from '@features/tags/api/useTagDimensions'
import { usePreloadVendors } from '@features/vendors/api/useListVendors'

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

  showCategorizationRules?: boolean
  showCustomerVendor?: boolean
  showDescriptions?: boolean
  showReceiptUploads?: boolean
  showStatusToggle?: boolean
  showTags?: boolean
  showTooltips?: boolean
  showUploadOptions?: boolean

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
}

type BankTransactionsTableViewProps = Omit<BankTransactionsProps, 'filters' | 'categorizeView'>

export const BankTransactions = ({
  onError,
  showTags = false,
  showCustomerVendor = false,
  monthlyView = false,
  applyGlobalDateRange = false,
  mode,
  renderInAppLink,
  categorizeView,
  filters,
  ...restProps
}: BankTransactionsWithErrorProps) => {
  usePreloadTagDimensions({ isEnabled: showTags })
  usePreloadCustomers({ isEnabled: showCustomerVendor })
  usePreloadVendors({ isEnabled: showCustomerVendor })
  usePreloadCategories()

  return (
    <ErrorBoundary onError={onError}>
      <BankTransactionsIsCategorizationEnabledProvider categorizeView={categorizeView}>
        <CategorizationRulesProvider>
          <BankTransactionsRouteStoreProvider>
            <BankTransactionsProvider
              monthlyView={monthlyView}
              applyGlobalDateRange={applyGlobalDateRange}
              filters={filters}
            >
              <LegacyModeProvider overrideMode={mode}>
                <BankTransactionTagVisibilityProvider showTags={showTags}>
                  <BankTransactionCustomerVendorVisibilityProvider showCustomerVendor={showCustomerVendor}>
                    <InAppLinkProvider renderInAppLink={renderInAppLink}>
                      <BulkSelectionStoreProvider>
                        <BankTransactionsCategoryStoreProvider>
                          <BankTransactionsContent {...restProps} />
                        </BankTransactionsCategoryStoreProvider>
                      </BulkSelectionStoreProvider>
                    </InAppLinkProvider>
                  </BankTransactionCustomerVendorVisibilityProvider>
                </BankTransactionTagVisibilityProvider>
              </LegacyModeProvider>
            </BankTransactionsProvider>
          </BankTransactionsRouteStoreProvider>
        </CategorizationRulesProvider>
      </BankTransactionsIsCategorizationEnabledProvider>
    </ErrorBoundary>
  )
}

const BankTransactionsContent = (props: BankTransactionsTableViewProps) => {
  const routeState = useBankTransactionsRouteState()

  return routeState.route === BankTransactionsRoute.BankTransactionsTable
    ? <BankTransactionsTableView {...props} />
    : <CategorizationRulesDrawer />
}

const BankTransactionsTableView = ({
  asWidget = false,
  pageSize = 20,

  showDescriptions = true,
  showReceiptUploads = true,
  showTooltips = false,
  showUploadOptions = false,
  showStatusToggle = true,

  mobileComponent,
  hideHeader = false,
  collapseHeader = false,
  stringOverrides,
  showCategorizationRules = false,
}: BankTransactionsTableViewProps) => {
  const scrollPaginationRef = useRef<HTMLDivElement>(null)
  const isVisible = useIsVisible(scrollPaginationRef)

  const { filters, dateFilterMode } = useBankTransactionsFiltersContext()
  const isMonthlyViewMode = dateFilterMode === BankTransactionsDateFilterMode.MonthlyView

  const { currentBankTransactionsPage: currentPage, setCurrentBankTransactionsPage: setCurrentPage } = useCurrentBankTransactionsPage()

  const {
    data,
    isLoading,
    isError,
    display,
    hasMore,
    fetchMore,
    removeAfterCategorize,
  } = useBankTransactionsContext()

  const { ruleSuggestion, setRuleSuggestion } = useContext(CategorizationRulesContext)

  const { data: linkedAccounts } = useLinkedAccounts()

  const isSyncing = useMemo(
    () => Boolean(linkedAccounts?.some(item => item.is_syncing)),
    [linkedAccounts],
  )

  useEffect(() => {
    // Fetch more when the user scrolls to the bottom of the page
    if (isMonthlyViewMode && isVisible && !isLoading && hasMore) {
      fetchMore()
    }
  }, [isMonthlyViewMode, isVisible, isLoading, hasMore, fetchMore])

  // Adjust current page to last page if total page count < current page
  useEffect(() => {
    if (isMonthlyViewMode || !data?.length || pageSize <= 0) return

    const maxPage = Math.ceil(data.length / pageSize)
    if (maxPage > 0 && currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [isMonthlyViewMode, data?.length, pageSize, currentPage, setCurrentPage])

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

  const [shiftStickyHeader, setShiftStickyHeader] = useState(0)
  const debounceShiftStickyHeader = debounce(setShiftStickyHeader, 500)
  const [listView, setListView] = useState(false)

  const removeTransaction = (bankTransaction: BankTransaction) =>
    removeAfterCategorize([bankTransaction.id])

  const containerRef = useElementSize<HTMLDivElement>((size) => {
    if (size.height >= 90) {
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
  })

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
          mobileComponent={mobileComponent}
          listView={listView}
          stringOverrides={stringOverrides?.bankTransactionsHeader}
          isSyncing={isSyncing}
          withUploadMenu={showUploadOptions}
          collapseHeader={collapseHeader}
          showStatusToggle={showStatusToggle}
          showCategorizationRules={showCategorizationRules}
        />
      )}

      {!listView && (
        <div className='Layer__bank-transactions__table-wrapper'>
          {rulesSuggestionModal}
          <BankTransactionsTable
            isLoading={isLoading}
            isSyncing={isSyncing}
            bankTransactions={bankTransactions}
            removeTransaction={removeTransaction}
            page={currentPage}
            stringOverrides={stringOverrides}
            lastPage={isLastPage}

            showDescriptions={showDescriptions}
            showReceiptUploads={showReceiptUploads}
            showTooltips={showTooltips}
          />
        </div>
      )}

      {!isLoadingWithoutData && listView && mobileComponent !== 'mobileList'
        && (
          <div className='Layer__bank-transactions__list-wrapper'>
            {rulesSuggestionModal}
            <BankTransactionsList
              bankTransactions={bankTransactions}
              removeTransaction={removeTransaction}
              stringOverrides={stringOverrides?.bankTransactionCTAs}

              showDescriptions={showDescriptions}
              showReceiptUploads={showReceiptUploads}
              showTooltips={showTooltips}
            />
          </div>
        )}

      {!isLoadingWithoutData && listView && mobileComponent === 'mobileList'
        && (
          <>
            <BankTransactionsMobileList
              bankTransactions={bankTransactions}
              removeTransaction={removeTransaction}
              showDescriptions={showDescriptions}
              showReceiptUploads={showReceiptUploads}
              showTooltips={showTooltips}
            />
            {rulesSuggestionDrawer}
          </>
        )}

      {listView && isLoadingWithoutData
        && (
          <div className='Layer__bank-transactions__list-loader'>
            <Loader />
          </div>
        )}

      {(!isSyncing || listView)
        && (
          <BankTransactionsTableEmptyStates
            hasVisibleTransactions={(bankTransactions?.length ?? 0) > 0}
            isError={isError}
            isFiltered={Boolean(filters?.query)}
            isLoadingWithoutData={isLoadingWithoutData}
          />
        )}

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
