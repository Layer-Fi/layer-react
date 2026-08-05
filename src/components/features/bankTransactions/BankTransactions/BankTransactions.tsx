import { type ReactNode } from 'react'

import { type BankTransactionFilters } from '@utils/features/bankTransactions/shared'
import type { LayerError } from '@utils/shared/api/errorHandler'
import { usePreloadCategories } from '@api/businesses/[business-id]/categories/get'
import { usePreloadCustomAccounts } from '@api/businesses/[business-id]/custom-accounts/get'
import { usePreloadCustomers } from '@api/businesses/[business-id]/customers/get'
import { usePreloadTagDimensions } from '@api/businesses/[business-id]/tags/dimensions/get'
import { usePreloadVendors } from '@api/businesses/[business-id]/vendors/get'
import { BankTransactionsProvider } from '@providers/bankTransactions/BankTransactions/BankTransactionsProvider'
import { BankTransactionsFeatureVisibilityProvider } from '@providers/bankTransactions/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { BankTransactionsFiltersProvider } from '@providers/bankTransactions/BankTransactionsFiltersContext/BankTransactionsFiltersProvider'
import { BankTransactionsPaginationProvider } from '@providers/bankTransactions/BankTransactionsPagination/BankTransactionsPaginationProvider'
import { BankTransactionsRouteStoreProvider } from '@providers/bankTransactions/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { BankTransactionsStringOverridesProvider } from '@providers/bankTransactions/BankTransactionsStringOverridesContext/BankTransactionsStringOverridesContext'
import { type BankTransactionsMode, LegacyModeProvider } from '@providers/bankTransactions/LegacyMode/LegacyModeProvider'
import { BankTransactionsCategorizationStoreProvider } from '@providers/categorization/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { BankTransactionsIsCategorizationEnabledProvider } from '@providers/categorization/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { CategorizationRulesProvider } from '@providers/categorization/CategorizationRulesContext/CategorizationRulesContext'
import { BulkSelectionStoreProvider } from '@providers/common/BulkSelectionStore/BulkSelectionStoreProvider'
import { InAppLinkProvider, type LinkingMetadata } from '@providers/common/InAppLink/InAppLinkContext'
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
