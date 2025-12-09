import { type MobileComponentType } from '@components/BankTransactions/constants'

import { BankTransactionsHeaderListView } from './BankTransactionsHeaderListView'
import { BankTransactionsHeaderTableView } from './BankTransactionsHeaderTableView'

export interface BankTransactionsHeaderProps {
  shiftStickyHeader: number
  asWidget?: boolean
  categorizedOnly?: boolean
  categorizeView?: boolean
  mobileComponent?: MobileComponentType
  listView?: boolean
  isSyncing?: boolean
  stringOverrides?: BankTransactionsHeaderStringOverrides
  withUploadMenu?: boolean
  showStatusToggle?: boolean
  collapseHeader?: boolean
  showCategorizationRules?: boolean
}

export interface BankTransactionsHeaderStringOverrides {
  header?: string
  downloadButton?: string
}

export const BankTransactionsHeader = ({
  shiftStickyHeader,
  asWidget,
  categorizedOnly,
  categorizeView = true,
  mobileComponent,
  listView,
  stringOverrides,
  isSyncing,
  withUploadMenu,
  showStatusToggle,
  collapseHeader,
  showCategorizationRules = false,
}: BankTransactionsHeaderProps) => {
  // For List view (both regularList and mobileList), use the simplified 2-row layout
  if (listView) {
    return (
      <BankTransactionsHeaderListView
        shiftStickyHeader={shiftStickyHeader}
        asWidget={asWidget}
        categorizedOnly={categorizedOnly}
        categorizeView={categorizeView}
        mobileComponent={mobileComponent}
        isSyncing={isSyncing}
        stringOverrides={stringOverrides}
        showStatusToggle={showStatusToggle}
      />
    )
  }

  return (
    <BankTransactionsHeaderTableView
      shiftStickyHeader={shiftStickyHeader}
      asWidget={asWidget}
      categorizedOnly={categorizedOnly}
      categorizeView={categorizeView}
      mobileComponent={mobileComponent}
      listView={listView}
      stringOverrides={stringOverrides}
      isSyncing={isSyncing}
      withUploadMenu={withUploadMenu}
      showStatusToggle={showStatusToggle}
      collapseHeader={collapseHeader}
      showCategorizationRules={showCategorizationRules}
    />
  )
}
