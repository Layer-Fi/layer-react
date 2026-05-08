import { type RefObject, useContext } from 'react'

import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { ChartOfAccountsContext } from '@contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import { ChartOfAccountsForm, type ChartOfAccountsFormStringOverrides } from '@components/ChartOfAccountsForm/ChartOfAccountsForm'
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
  const { form } = useContext(ChartOfAccountsContext)

  const { inputValue, searchQuery, handleInputChange } = useDebouncedSearchInput({ initialInputState: '' })

  return (
    <ExpandableDataTableProvider>
      <Panel
        sidebar={(
          <ChartOfAccountsForm
            stringOverrides={stringOverrides?.chartOfAccountsForm}
          />
        )}
        sidebarIsOpen={!!form}
        parentRef={containerRef}
      >
        <ChartOfAccountsTableHeader
          asWidget={asWidget}
          withDateControl={withDateControl}
          withExpandAllButton={withExpandAllButton}
          showAddAccountButton={showAddAccountButton}
          inputValue={inputValue}
          onSearchChange={handleInputChange}
          stringOverrides={stringOverrides}
        />

        <ChartOfAccountsTable
          searchQuery={searchQuery}
          stringOverrides={stringOverrides}
          templateAccountsEditable={templateAccountsEditable}
        />
      </Panel>
    </ExpandableDataTableProvider>
  )
}
