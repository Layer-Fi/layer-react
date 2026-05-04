import { type RefObject, useContext, useMemo } from 'react'

import { asMutable } from '@utils/asMutable'
import { useDebouncedSearchInput } from '@hooks/utils/debouncing/useDebouncedSearchQuery'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { ChartOfAccountsContext } from '@contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import { ChartOfAccountsForm, type ChartOfAccountsFormStringOverrides } from '@components/ChartOfAccountsForm/ChartOfAccountsForm'
import { ChartOfAccountsTable } from '@components/ChartOfAccountsTable/ChartOfAccountsTable'
import { ChartOfAccountsTableHeader } from '@components/ChartOfAccountsTable/ChartOfAccountsTableHeader'
import { filterAccounts, getInitialExpandedState } from '@components/ChartOfAccountsTable/utils/utils'
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
  const { form, data } = useContext(ChartOfAccountsContext)
  const { formatCurrencyFromCents } = useIntlFormatter()

  const { inputValue, searchQuery, handleInputChange } = useDebouncedSearchInput({ initialInputState: '' })
  const filteredAccounts = useMemo(() => {
    if (!data) return undefined
    if (!searchQuery) return data.accounts

    return filterAccounts(
      asMutable(data.accounts),
      searchQuery.toLowerCase(),
      formatCurrencyFromCents,
    )
  }, [data, formatCurrencyFromCents, searchQuery])
  const initialExpanded = useMemo(
    () => getInitialExpandedState(filteredAccounts),
    [filteredAccounts],
  )
  const expandableTableKey = useMemo(() => {
    const accountKey = filteredAccounts?.map(account => account.accountId).join(',') || 'none'
    return `${searchQuery}-${accountKey}`
  }, [filteredAccounts, searchQuery])

  return (
    <ExpandableDataTableProvider key={expandableTableKey} initialExpanded={initialExpanded}>
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
