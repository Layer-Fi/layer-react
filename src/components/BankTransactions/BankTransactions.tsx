import { type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'

import type { LayerError } from '@utils/api/errorHandler'
import { type BankTransactionFilters } from '@utils/bankTransactions/shared'
import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { usePreloadCategories } from '@hooks/api/businesses/[business-id]/categories/useCategories'
import { usePreloadCustomers } from '@hooks/api/businesses/[business-id]/customers/useListCustomers'
import { usePreloadTagDimensions } from '@hooks/api/businesses/[business-id]/tags/dimensions/useTagDimensions'
import { usePreloadVendors } from '@hooks/api/businesses/[business-id]/vendors/useListVendors'
import { useElementSize } from '@hooks/utils/size/useElementSize'
import { useIsVisible } from '@hooks/utils/visibility/useIsVisible'
import { useBankAccountFilterActions } from '@providers/BankAccountsFilterStore/BankAccountsFilterStoreProvider'
import { BankTransactionsCategorizationStoreProvider } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { BankTransactionsFeatureVisibilityProvider } from '@providers/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { BankTransactionsProvider } from '@providers/BankTransactionsPaginationProvider/BankTransactionsProvider'
import { BankTransactionsPaginationProvider } from '@providers/BankTransactionsProvider/BankTransactionsPaginationProvider'
import { BankTransactionsRoute, BankTransactionsRouteStoreProvider, useBankTransactionsRouteState } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { BulkSelectionStoreProvider, useCountSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { type BankTransactionsMode, LegacyModeProvider } from '@providers/LegacyModeProvider/LegacyModeProvider'
import { useBankAccountsContext } from '@contexts/BankAccountsContext/BankAccountsContext'
import {
  useBankTransactionsContext,
} from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { BankTransactionsFiltersProvider } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersProvider'
import { BankTransactionsIsCategorizationEnabledProvider } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { BankTransactionsStringOverridesProvider } from '@contexts/BankTransactionsStringOverridesContext/BankTransactionsStringOverridesContext'
import { CategorizationRulesContext, CategorizationRulesProvider } from '@contexts/CategorizationRulesContext/CategorizationRulesContext'
import { InAppLinkProvider, type LinkingMetadata } from '@contexts/InAppLinkContext'
import {
  BankTransactionsHeader,
  type BankTransactionsHeaderStringOverrides,
} from '@components/BankTransactions/BankTransactionsHeader'
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
  'asWidget' | 'mobileComponent' | 'hideHeader' | 'collapseHeader'
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
  // Preloaded unconditionally (not gated on showCustomerVendor) because the
  // record/edit transaction modal needs customers and vendors regardless.
  usePreloadCustomers()
  usePreloadVendors()
  usePreloadCategories()

  return (
    <ErrorBoundary onError={onError}>
      <LegacyModeProvider overrideMode={mode}>
        <BankTransactionsIsCategorizationEnabledProvider>
          <CategorizationRulesProvider>
            <BankTransactionsRouteStoreProvider>
              <BankTransactionsFiltersProvider
                monthlyView={monthlyView}
                applyGlobalDateRange={applyGlobalDateRange}
                filters={filters}
              >
                <BankTransactionsProvider>
                  <BankTransactionsPaginationProvider pageSize={pageSize}>
                    <BankTransactionsFeatureVisibilityProvider {...featureVisibility}>
                      <BankTransactionsStringOverridesProvider stringOverrides={stringOverrides}>
                        <InAppLinkProvider renderInAppLink={renderInAppLink}>
                          <BulkSelectionStoreProvider>
                            <BankTransactionsCategorizationStoreProvider>
                              <BankTransactionsContent
                                asWidget={asWidget}
                                mobileComponent={mobileComponent}
                                hideHeader={hideHeader}
                                collapseHeader={collapseHeader}
                              />
                            </BankTransactionsCategorizationStoreProvider>
                          </BulkSelectionStoreProvider>
                        </InAppLinkProvider>
                      </BankTransactionsStringOverridesProvider>
                    </BankTransactionsFeatureVisibilityProvider>
                  </BankTransactionsPaginationProvider>
                </BankTransactionsProvider>
              </BankTransactionsFiltersProvider>
            </BankTransactionsRouteStoreProvider>
          </CategorizationRulesProvider>
        </BankTransactionsIsCategorizationEnabledProvider>
      </LegacyModeProvider>
    </ErrorBoundary>
  )
}

const LockBankAccountFilter = () => {
  const { setLocked } = useBankAccountFilterActions()

  useEffect(() => {
    setLocked(true)
    return () => setLocked(false)
  }, [setLocked])

  return null
}

const BankTransactionsContent = (props: BankTransactionsTableViewProps) => {
  const routeState = useBankTransactionsRouteState()
  const { count } = useCountSelectedIds()

  return (
    <>
      {count > 0 && <LockBankAccountFilter />}
      {routeState.route === BankTransactionsRoute.BankTransactionsTable
        ? <BankTransactionsTableView {...props} />
        : <ResponsiveCategorizationRulesView />}
    </>
  )
}

type BankTransactionsTableContentViewProps = {
  content: BankTransactionsTableContent
}

const BankTransactionsTableContentView = ({
  content,
}: BankTransactionsTableContentViewProps) => {
  switch (content) {
    case BankTransactionsTableContent.Table:
      return <BankTransactionsTable />
    case BankTransactionsTableContent.List:
      return <BankTransactionsList />
    case BankTransactionsTableContent.MobileList:
      return <BankTransactionsMobileList />
    default:
      return unsafeAssertUnreachable({
        value: content,
        message: 'Unexpected table view content',
      })
  }
}

const BankTransactionsTableView = ({
  asWidget = false,

  mobileComponent,
  hideHeader = false,
  collapseHeader = false,
}: BankTransactionsTableViewProps) => {
  const scrollPaginationRef = useRef<HTMLDivElement>(null)
  const isVisible = useIsVisible(scrollPaginationRef)

  const { isMonthlyViewMode } = useBankTransactionsFiltersContext()

  const { isLoading, hasMore, fetchMore } = useBankTransactionsContext()
  const { isSyncing } = useBankAccountsContext()

  const { setRuleSuggestion, ruleSuggestion } = useContext(CategorizationRulesContext)

  useEffect(() => {
    // Fetch more when the user scrolls to the bottom of the page
    if (isMonthlyViewMode && isVisible && !isLoading && hasMore) {
      fetchMore()
    }
  }, [isMonthlyViewMode, isVisible, isLoading, hasMore, fetchMore])

  const handleRuleSuggestionOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) setRuleSuggestion(null)
  }, [setRuleSuggestion])

  const [listView, setListView] = useState(false)

  const containerRef = useElementSize<HTMLDivElement>((size) => {
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

  return (
    <Container
      className='Layer__Public'
      transparentBg={listView && mobileComponent === 'mobileList'}
      name={COMPONENT_NAME}
      asWidget={asWidget}
      ref={containerRef}
    >
      {!hideHeader && (
        <BankTransactionsHeader
          asWidget={asWidget}
          tableContentMode={tableContentMode}
          isSyncing={isSyncing}
          collapseHeader={collapseHeader}
        />
      )}

      <BankTransactionsTableContentView content={tableContentMode} />

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
