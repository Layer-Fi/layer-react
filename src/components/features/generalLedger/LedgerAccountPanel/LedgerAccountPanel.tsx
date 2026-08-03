import {
  type RefObject,
  useContext,
} from 'react'

import { LedgerAccountsContext } from '@contexts/LedgerAccountsContext/LedgerAccountsContext'
import { VStack } from '@ui/Stack/Stack'
import { Panel } from '@blocks/Layout/View/Panel/Panel'
import { LedgerAccountEntryDetails } from '@features/generalLedger/LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { type LedgerAccountEntryDetailsStringOverrides } from '@features/generalLedger/LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { LedgerAccountLineItemsTable, type LedgerAccountLineItemsTableStringOverrides } from '@features/generalLedger/LedgerAccountLineItemsTable/LedgerAccountLineItemsTable'
import { LedgerAccountPanelHeader } from '@features/generalLedger/LedgerAccountPanelHeader/LedgerAccountPanelHeader'

import './ledgerAccountPanel.scss'

export interface LedgerAccountStringOverrides {
  ledgerEntryDetail?: LedgerAccountEntryDetailsStringOverrides
  ledgerEntriesTable?: LedgerAccountLineItemsTableStringOverrides
}

export interface LedgerAccountProps {
  containerRef: RefObject<HTMLDivElement>
  pageSize?: number
  stringOverrides?: LedgerAccountStringOverrides
}

export const LedgerAccountPanel = ({
  containerRef,
  pageSize = 15,
  stringOverrides,
}: LedgerAccountProps) => {
  const {
    setSelectedAccount,
    selectedEntryId,
    closeSelectedEntry,
  } = useContext(LedgerAccountsContext)

  const close = () => {
    setSelectedAccount(undefined)
    closeSelectedEntry()
  }

  return (
    <Panel
      sidebar={(
        <LedgerAccountEntryDetails
          stringOverrides={stringOverrides?.ledgerEntryDetail}
        />
      )}
      sidebarIsOpen={Boolean(selectedEntryId)}
      parentRef={containerRef}
      className='Layer__LedgerAccountPanel'
    >
      <VStack>
        <LedgerAccountPanelHeader onClose={close} />
        <LedgerAccountLineItemsTable
          pageSize={pageSize}
          stringOverrides={stringOverrides?.ledgerEntriesTable}
        />
      </VStack>
    </Panel>
  )
}
