import { type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { debounce } from 'lodash-es'

import { DisplayState } from '@internal-types/bankTransactions'
import type { LayerError } from '@utils/api/errorHandler'
import { isAnyBankAccountSyncing } from '@utils/bankAccount'
import { type BankTransactionFilters, BankTransactionsDateFilterMode } from '@utils/bankTransactions/shared'
import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { usePreloadCategories } from '@hooks/api/businesses/[business-id]/categories/useCategories'
import { usePreloadCustomers } from '@hooks/api/businesses/[business-id]/customers/useListCustomers'
import { usePreloadTagDimensions } from '@hooks/api/businesses/[business-id]/tags/dimensions/useTagDimensions'
import { usePreloadVendors } from '@hooks/api/businesses/[business-id]/vendors/useListVendors'
import { useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'
import { useEmitLayerEvent } from '@hooks/useEmitLayerEvent'
import { PaginationChangeSource } from '@hooks/utils/pagination/types'
import { useAutoResetPageIndex } from '@hooks/utils/pagination/useAutoResetPageIndex'
import { useElementSize } from '@hooks/utils/size/useElementSize'
import { useIsVisible } from '@hooks/utils/visibility/useIsVisible'
import { BankTransactionsCategorizationStoreProvider } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { BankTransactionsFeatureVisibilityStoreProvider } from '@providers/BankTransactionsFeatureVisibilityStore/BankTransactionsFeatureVisibilityStoreProvider'
import { BankTransactionsProvider } from '@providers/BankTransactionsProvider/BankTransactionsProvider'
import { BankTransactionsRoute, BankTransactionsRouteStoreProvider, useBankTransactionsRouteState, useCurrentBankTransactionsPage } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { BulkSelectionStoreProvider } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { LayerEventComponent, LayerEventType } from '@providers/LayerProvider/layerEvents'
import { type BankTransactionsMode, LegacyModeProvider } from '@providers/LegacyModeProvider/LegacyModeProvider'
import {
  useBankTransactionsContext,
} from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { BankTransactionsIsCategorizationEnabledProvider } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { CategorizationRulesContext, CategorizationRulesProvider } from '@contexts/CategorizationRulesContext/CategorizationRulesContext'
import { InAppLinkProvider, type LinkingMetadata } from '@contexts/InAppLinkContext'
import { MobileListSkeleton } from '@ui/MobileList/MobileListSkeleton'
import {
  BankTransactionsHeader,
  type BankTransactionsHeaderStringOverrides,
} from '@components/BankTransactions/BankTransactionsHeader'
import { BankTransactionsListWithEmptyStates } from '@components/BankTransactions/BankTransactionsTableEmptyState'
import { BankTransactionsTableContent, type MobileComponentType } from '@components/BankTransactions/constants'
import { BankTransactionsList } from '@components/BankTransactionsList/BankTransactionsList'
import { BankTransactionsMobileList } from '@components/BankTransactionsMobileList/BankTransactionsMobileList'
import {
  BankTransactionsTable,
  type BankTransactionsTableStringOverrides,
} from '@components/BankTransactionsTable/BankTransactionsTable'
import { ResponsiveCategorizationRulesView } from '@components/CategorizationRules/CategorizationRulesView/ResponsiveCategorizationRulesView'
import { Container } from '@components/Container/Container'
import { ErrorBoundary } from '@components/ErrorBoundary/ErrorBoundary'
import { Loader } from '@components/Loader/Loader'
import { SuggestedCategorizationRuleUpdatesDialog } from '@components/SuggestedCategorizationRuleUpdates/SuggestedCategorizationRuleUpdatesDialog'

import './bankTransactions.scss'

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

  /**
   * @deprecated `categorizeView` is no longer used. Categorization is enabled based on the bookkeeping configuration of a business.
   */
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

type BankTransactionsTableViewProps = Pick<
  BankTransactionsProps,
  'asWidget' | 'pageSize' | 'mobileComponent' | 'hideHeader' | 'collapseHeader' | 'stringOverrides'
>

export const BankTransactions = ({
  onError,
  monthlyView = false,
  applyGlobalDateRange = false,
  mode,
  renderInAppLink,
  filters,
  categorizeView: _categorizeView,

  asWidget,
  pageSize,
  mobileComponent,
  hideHeader,
  collapseHeader,
  stringOverrides,

  ...featureVisibility
}: BankTransactionsWithErrorProps) => {
  usePreloadTagDimensions({ isEnabled: featureVisibility.showTags })
  usePreloadCustomers({ isEnabled: featureVisibility.showCustomerVendor })
  usePreloadVendors({ isEnabled: featureVisibility.showCustomerVendor })
  usePreloadCategories()

  return (
    <ErrorBoundary onError={onError}>
      <LegacyModeProvider overrideMode={mode}>
        <BankTransactionsIsCategorizationEnabledProvider>
          <CategorizationRulesProvider>
            <BankTransactionsRouteStoreProvider>
              <BankTransactionsProvider
                monthlyView={monthlyView}
                applyGlobalDateRange={applyGlobalDateRange}
                filters={filters}
              >
                <BankTransactionsFeatureVisibilityStoreProvider {...featureVisibility}>
                  <InAppLinkProvider renderInAppLink={renderInAppLink}>
                    <BulkSelectionStoreProvider>
                      <BankTransactionsCategorizationStoreProvider>
                        <BankTransactionsContent
                          asWidget={asWidget}
                          pageSize={pageSize}
                          mobileComponent={mobileComponent}
                          hideHeader={hideHeader}
                          collapseHeader={collapseHeader}
                          stringOverrides={stringOverrides}
                        />
                      </BankTransactionsCategorizationStoreProvider>
                    </BulkSelectionStoreProvider>
                  </InAppLinkProvider>
                </BankTransactionsFeatureVisibilityStoreProvider>
              </BankTransactionsProvider>
            </BankTransactionsRouteStoreProvider>
          </CategorizationRulesProvider>
        </BankTransactionsIsCategorizationEnabledProvider>
      </LegacyModeProvider>
    </ErrorBoundary>
  )
}

const BankTransactionsContent = (props: BankTransactionsTableViewProps) => {
  const routeState = useBankTransactionsRouteState()

  return routeState.route === BankTransactionsRoute.BankTransactionsTable
    ? <BankTransactionsTableView {...props} />
    : <ResponsiveCategorizationRulesView />
}

const BankTransactionsTableView = ({
  asWidget = false,
  pageSize = 20,

  mobileComponent,
  hideHeader = false,
  collapseHeader = false,
  stringOverrides,
}: BankTransactionsTableViewProps) => {
  const scrollPaginationRef = useRef<HTMLDivElement>(null)
  const isVisible = useIsVisible(scrollPaginationRef)

  const { dateFilterMode, filters } = useBankTransactionsFiltersContext()
  const isMonthlyViewMode = dateFilterMode === BankTransactionsDateFilterMode.MonthlyView

  const { currentBankTransactionsPage: currentPage, setCurrentBankTransactionsPage: setCurrentPage } = useCurrentBankTransactionsPage()
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.BankTransactions)

  const { data, isLoading, display, hasMore, fetchMore } = useBankTransactionsContext()
  const autoResetPageIndexRef = useAutoResetPageIndex(filters, data)

  const { setRuleSuggestion, ruleSuggestion } = useContext(CategorizationRulesContext)

  const { data: linkedAccounts } = useLinkedAccounts()

  const isSyncing = useMemo(
    () => isAnyBankAccountSyncing(linkedAccounts ?? []),
    [linkedAccounts],
  )

  useEffect(() => {
    // Fetch more when the user scrolls to the bottom of the page
    if (isMonthlyViewMode && isVisible && !isLoading && hasMore) {
      fetchMore()
    }
  }, [isMonthlyViewMode, isVisible, isLoading, hasMore, fetchMore])

  const handleRuleSuggestionOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) setRuleSuggestion(null)
  }, [setRuleSuggestion])

  const [shiftStickyHeader, setShiftStickyHeader] = useState(0)
  const debounceShiftStickyHeader = debounce(setShiftStickyHeader, 500)
  const [listView, setListView] = useState(false)

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

  const tableContentMode = listView && mobileComponent === 'mobileList'
    ? BankTransactionsTableContent.MobileList
    : listView
      ? BankTransactionsTableContent.List
      : BankTransactionsTableContent.Table

  const handlePageChange = useCallback((pageIndex: number, source: PaginationChangeSource) => {
    const page = pageIndex + 1

    if (page === currentPage) return

    setCurrentPage(page)

    if (source === PaginationChangeSource.User) {
      emitLayerEvent({
        type: LayerEventType.TransactionsPageChanged,
        version: 1,
        payload: { page },
      })
    }
  }, [currentPage, emitLayerEvent, setCurrentPage])

  const tablePaginationProps = useMemo(() => ({
    pageIndex: currentPage - 1,
    onPageIndexChange: handlePageChange,
    pageSize,
    hasMore,
    fetchMore,
    autoResetPageIndexRef,
  }), [autoResetPageIndexRef, currentPage, fetchMore, handlePageChange, hasMore, pageSize])

  const BankTransactionsTableViewContent = useMemo(() => {
    return (
      <div className='Layer__bank-transactions__table-wrapper Layer__BankTransactions__TableWrapper'>
        <BankTransactionsTable
          isLoading={isLoading}
          bankTransactions={data}
          stringOverrides={stringOverrides}
          isMonthlyViewMode={isMonthlyViewMode}
          paginationProps={tablePaginationProps}
        />
      </div>
    )
  }, [
    data,
    isLoading,
    isMonthlyViewMode,
    stringOverrides,
    tablePaginationProps,
  ])

  const BankTransactionsListLoader = useMemo(() => {
    return (
      <div className='Layer__bank-transactions__list-loader'>
        <Loader />
      </div>
    )
  }, [])

  const BankTransactionsListView = useMemo(() => {
    return (
      <BankTransactionsList
        bankTransactions={data}
        stringOverrides={stringOverrides?.bankTransactionCTAs}
        isMonthlyViewMode={isMonthlyViewMode}
        paginationProps={tablePaginationProps}
      />
    )
  }, [data, isMonthlyViewMode, stringOverrides?.bankTransactionCTAs, tablePaginationProps])

  const BankTransactionsMobileListView = useMemo(() => {
    return (
      <BankTransactionsMobileList
        bankTransactions={data}
        isMonthlyViewMode={isMonthlyViewMode}
        paginationProps={tablePaginationProps}
      />
    )
  }, [data, isMonthlyViewMode, tablePaginationProps])

  const slots = useMemo(() => {
    switch (tableContentMode) {
      case BankTransactionsTableContent.Table:
        return {
          List: BankTransactionsTableViewContent,
        }
      case BankTransactionsTableContent.List:
        return {
          List: BankTransactionsListView,
          Loader: BankTransactionsListLoader,
        }
      case BankTransactionsTableContent.MobileList:
        return {
          List: BankTransactionsMobileListView,
          Loader: <MobileListSkeleton />,
        }
      default:
        return unsafeAssertUnreachable({
          value: tableContentMode,
          message: 'Unexpected table view content mode',
        })
    }
  }, [
    tableContentMode,
    BankTransactionsTableViewContent,
    BankTransactionsListView,
    BankTransactionsListLoader,
    BankTransactionsMobileListView,
  ])

  const isEmpty = tableContentMode === BankTransactionsTableContent.Table
    ? false
    : (data?.length ?? 0) === 0

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
          tableContentMode={tableContentMode}
          stringOverrides={stringOverrides?.bankTransactionsHeader}
          isSyncing={isSyncing}
          collapseHeader={collapseHeader}
        />
      )}

      <BankTransactionsListWithEmptyStates isEmpty={isEmpty} slots={slots} />

      <SuggestedCategorizationRuleUpdatesDialog
        isOpen={!!ruleSuggestion}
        onOpenChange={handleRuleSuggestionOpenChange}
        ruleSuggestion={ruleSuggestion}
        variant={tableContentMode === BankTransactionsTableContent.MobileList ? 'drawer' : 'modal'}
      />

      {isMonthlyViewMode ? <div ref={scrollPaginationRef} /> : null}
    </Container>
  )
}
