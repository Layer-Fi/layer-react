import { type RefObject } from 'react'

import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useBookkeepingStatusContext } from '@contexts/BookkeepingStatusContext/BookkeepingStatusContext'
import { ChartOfAccountsForm, type ChartOfAccountsFormStringOverrides } from '@components/ChartOfAccountsForm/ChartOfAccountsForm'
import { useChartOfAccountsFormMode } from '@components/ChartOfAccountsForm/useChartOfAccountsFormMode'
import { ChartOfAccountsTable } from '@components/ChartOfAccountsTable/ChartOfAccountsTable'
import { ChartOfAccountsTableHeader } from '@components/ChartOfAccountsTable/ChartOfAccountsTableHeader'
import { ExpandableDataTableProvider } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { Panel } from '@components/Panel/Panel'

export interface ChartOfAccountsTableStringOverrides {
  headerText?: string
  addAccountButtonText?: string
  csvDownloadButtonText?: string
  nameColumnHeader?: string
  numberColumnHeader?: string
  typeColumnHeader?: string
  balanceColumnHeader?: string
  subtypeColumnHeader?: string
  chartOfAccountsForm?: ChartOfAccountsFormStringOverrides
}

export const ChartOfAccountsTableWithPanel = ({
  containerRef,
  asWidget = false,
  withDateControl = false,
  withExpandAllButton = false,
  showAddAccountButton = true,
  stringOverrides,
  templateAccountsEditable,
}: {
  containerRef: RefObject<HTMLDivElement>
  asWidget?: boolean
  withDateControl?: boolean
  withExpandAllButton?: boolean
  showAddAccountButton?: boolean
  stringOverrides?: ChartOfAccountsTableStringOverrides
  templateAccountsEditable?: boolean
}) => {
  const { formMode, addAccount, editAccount, cancelForm } = useChartOfAccountsFormMode()
  const { isActiveBookkeepingStatus } = useBookkeepingStatusContext()

  const { inputValue, searchQuery, handleInputChange } = useDebouncedSearchInput({ initialInputState: '' })
  const canShowAddAccountButton = showAddAccountButton && !isActiveBookkeepingStatus

  return (
    <ExpandableDataTableProvider>
      <Panel
        sidebar={(
          <ChartOfAccountsForm
            formMode={formMode}
            onCancel={cancelForm}
            stringOverrides={stringOverrides?.chartOfAccountsForm}
          />
        )}
        sidebarIsOpen={!!formMode}
        parentRef={containerRef}
      >
        <ChartOfAccountsTableHeader
          asWidget={asWidget}
          withDateControl={withDateControl}
          withExpandAllButton={withExpandAllButton}
          showAddAccountButton={canShowAddAccountButton}
          onAddAccount={addAccount}
          inputValue={inputValue}
          onSearchChange={handleInputChange}
          stringOverrides={stringOverrides}
        />

        <ChartOfAccountsTable
          searchQuery={searchQuery}
          onEditAccount={editAccount}
          stringOverrides={stringOverrides}
          templateAccountsEditable={templateAccountsEditable}
        />
      </Panel>
    </ExpandableDataTableProvider>
  )
}
