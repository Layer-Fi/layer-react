import { type ReactNode } from 'react'

import type { LayerError } from '@utils/api/errorHandler'
import { type BankTransactionFilters } from '@utils/bankTransactions/shared'
import { usePreloadCategories } from '@api/businesses/[business-id]/categories/get'
import { usePreloadCustomAccounts } from '@api/businesses/[business-id]/custom-accounts/get'
import { usePreloadCustomers } from '@api/businesses/[business-id]/customers/get'
import { usePreloadTagDimensions } from '@api/businesses/[business-id]/tags/dimensions/get'
import { usePreloadVendors } from '@api/businesses/[business-id]/vendors/get'
import { BankTransactionsCategorizationStoreProvider } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { BankTransactionsFeatureVisibilityProvider } from '@providers/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { BankTransactionsProvider } from '@providers/BankTransactionsPaginationProvider/BankTransactionsProvider'
import { BankTransactionsPaginationProvider } from '@providers/BankTransactionsProvider/BankTransactionsPaginationProvider'
import { BankTransactionsRouteStoreProvider } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { BulkSelectionStoreProvider } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { type BankTransactionsMode, LegacyModeProvider } from '@providers/LegacyModeProvider/LegacyModeProvider'
import { BankTransactionsFiltersProvider } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersProvider'
import { BankTransactionsIsCategorizationEnabledProvider } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { BankTransactionsStringOverridesProvider } from '@contexts/BankTransactionsStringOverridesContext/BankTransactionsStringOverridesContext'
import { CategorizationRulesProvider } from '@contexts/CategorizationRulesContext/CategorizationRulesContext'
import { InAppLinkProvider, type LinkingMetadata } from '@contexts/InAppLinkContext'
import { ErrorBoundary } from '@components/utility/ErrorBoundary/ErrorBoundary'
import { BankTransactionsRouter } from '@features/bankTransactions/BankTransactionsRouter/BankTransactionsRouter'
import { type MobileComponentType } from '@features/bankTransactions/constants'
import { type BankTransactionsStringOverrides } from '@features/bankTransactions/types'

export interface BankTransactionsProps {
  asWidget?: boolean
  pageSize?: number
  /**
   * @deprecated `mode` can be inferred from the bookkeeping configuration of a business
   */
  mode?: BankTransactionsMode

  showCategorizationRules?: boolean
  showCustomerVendor?: boolean
  /**
   * @deprecated This prop is no longer honored; transaction descriptions are always enabled.
   */
  showDescriptions?: boolean
  /**
   * @deprecated This prop is no longer honored; receipt uploads are always enabled.
   */
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

export const BankTransactions = ({
  onError,
  monthlyView = false,
  applyGlobalDateRange = false,
  mode,
  renderInAppLink,
  filters,
  categorizeView: _categorizeView,
  showDescriptions: _showDescriptions,
  showReceiptUploads: _showReceiptUploads,

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
  usePreloadCustomAccounts({ isEnabled: featureVisibility.showUploadOptions })
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
                              <BankTransactionsRouter
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
