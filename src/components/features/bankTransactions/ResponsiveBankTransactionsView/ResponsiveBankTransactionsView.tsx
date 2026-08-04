import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { useElementSize } from '@hooks/utils/size/useElementSize'
import { useIsVisible } from '@hooks/utils/visibility/useIsVisible'
import { useBankTransactionsContext } from '@providers/bankTransactions/BankTransactions/BankTransactionsContext'
import { useBankTransactionsFiltersContext } from '@providers/bankTransactions/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { CategorizationRulesContext } from '@providers/categorization/CategorizationRulesContext/CategorizationRulesContext'
import { useBankAccountsContext } from '@providers/global/BankAccountsContext/BankAccountsContext'
import { Container } from '@blocks/Layout/Container/Container'
import { type BankTransactionsProps } from '@features/bankTransactions/BankTransactions/BankTransactions'
import { BankTransactionsHeader } from '@features/bankTransactions/BankTransactionsHeader/BankTransactionsHeader'
import { BankTransactionsList } from '@features/bankTransactions/BankTransactionsList/BankTransactionsList'
import { BankTransactionsMobileList } from '@features/bankTransactions/BankTransactionsMobileList/BankTransactionsMobileList'
import { BankTransactionsTable } from '@features/bankTransactions/BankTransactionsTable/BankTransactionsTable'
import { BankTransactionsViewVariant } from '@features/bankTransactions/constants'
import { SuggestedCategorizationRuleUpdatesDialog } from '@features/categorization/SuggestedCategorizationRuleUpdatesDialog/SuggestedCategorizationRuleUpdatesDialog'

import './responsiveBankTransactionsView.scss'

// Kept as the Container name so the published Layer__bank-transactions class is unchanged.
const COMPONENT_NAME = 'bank-transactions'

export type ResponsiveBankTransactionsViewProps = Pick<
  BankTransactionsProps,
  'asWidget' | 'mobileComponent' | 'hideHeader' | 'collapseHeader'
>

type BankTransactionsViewVariantContentProps = {
  variant: BankTransactionsViewVariant
}

const BankTransactionsViewVariantContent = ({
  variant,
}: BankTransactionsViewVariantContentProps) => {
  switch (variant) {
    case BankTransactionsViewVariant.Table:
      return <BankTransactionsTable />
    case BankTransactionsViewVariant.List:
      return <BankTransactionsList />
    case BankTransactionsViewVariant.MobileList:
      return <BankTransactionsMobileList />
    default:
      return unsafeAssertUnreachable({
        value: variant,
        message: 'Unexpected table view content',
      })
  }
}

export const ResponsiveBankTransactionsView = ({
  asWidget = false,

  mobileComponent,
  hideHeader = false,
  collapseHeader = false,
}: ResponsiveBankTransactionsViewProps) => {
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

  const viewVariant = listView && mobileComponent === 'mobileList'
    ? BankTransactionsViewVariant.MobileList
    : listView
      ? BankTransactionsViewVariant.List
      : BankTransactionsViewVariant.Table

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
          tableContentMode={viewVariant}
          isSyncing={isSyncing}
          collapseHeader={collapseHeader}
        />
      )}

      <BankTransactionsViewVariantContent variant={viewVariant} />

      <SuggestedCategorizationRuleUpdatesDialog
        isOpen={!!ruleSuggestion}
        onOpenChange={handleRuleSuggestionOpenChange}
        ruleSuggestion={ruleSuggestion}
        variant={viewVariant === BankTransactionsViewVariant.MobileList ? 'drawer' : 'modal'}
      />

      {isMonthlyViewMode ? <div ref={scrollPaginationRef} /> : null}
    </Container>
  )
}
