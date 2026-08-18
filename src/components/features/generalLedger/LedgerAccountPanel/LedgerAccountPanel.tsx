import { type RefObject } from 'react'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import {
  useChartOfAccountsSelectionActions,
  useSelectedLedgerEntryId,
} from '@providers/features/generalLedger/ChartOfAccountsSelectionStore/ChartOfAccountsSelectionStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Panel } from '@blocks/Layout/View/Panel/Panel'
import { LedgerAccountEntryDetails } from '@features/generalLedger/LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { type LedgerAccountEntryDetailsStringOverrides } from '@features/generalLedger/LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { LedgerAccountLineItemsTable, type LedgerAccountLineItemsTableStringOverrides } from '@features/generalLedger/LedgerAccountLineItemsTable/LedgerAccountLineItemsTable'
import { LedgerAccountPanelHeader } from '@features/generalLedger/LedgerAccountPanelHeader/LedgerAccountPanelHeader'

import './ledgerAccountPanel.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__LedgerAccountPanel: 'Layer__ledger-account__panel',
})

export interface LedgerAccountStringOverrides {
  ledgerEntryDetail?: LedgerAccountEntryDetailsStringOverrides
  ledgerEntriesTable?: LedgerAccountLineItemsTableStringOverrides
}

export interface LedgerAccountProps {
  containerRef: RefObject<HTMLDivElement>
  pageSize?: number
  filterByDateRange?: boolean
  stringOverrides?: LedgerAccountStringOverrides
}

export const LedgerAccountPanel = ({
  containerRef,
  pageSize = 15,
  filterByDateRange,
  stringOverrides,
}: LedgerAccountProps) => {
  const selectedEntryId = useSelectedLedgerEntryId()
  const { clearSelection } = useChartOfAccountsSelectionActions()

  return (
    <Panel
      sidebar={(
        <LedgerAccountEntryDetails
          stringOverrides={stringOverrides?.ledgerEntryDetail}
        />
      )}
      sidebarIsOpen={Boolean(selectedEntryId)}
      parentRef={containerRef}
      className={legacyClassNames('Layer__LedgerAccountPanel')}
    >
      <VStack>
        <LedgerAccountPanelHeader onClose={clearSelection} filterByDateRange={filterByDateRange} />
        <LedgerAccountLineItemsTable
          pageSize={pageSize}
          filterByDateRange={filterByDateRange}
          stringOverrides={stringOverrides?.ledgerEntriesTable}
        />
      </VStack>
    </Panel>
  )
}
