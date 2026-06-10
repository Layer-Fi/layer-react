import {
  type RefObject,
  useContext,
} from 'react'

import { LedgerAccountsContext } from '@contexts/LedgerAccountsContext/LedgerAccountsContext'
import { VStack } from '@ui/Stack/Stack'
import { LedgerAccountEntryDetails } from '@components/LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { type LedgerAccountEntryDetailsStringOverrides } from '@components/LedgerAccountEntryDetails/LedgerAccountEntryDetails'
import { LedgerAccountPanelHeader } from '@components/LedgerAccountPanel/LedgerAccountPanelHeader'
import { LedgerLineItemsTable, type LedgerLineItemsTableStringOverrides } from '@components/LedgerAccountPanel/LedgerLineItemsTable'
import { Panel } from '@components/Panel/Panel'

import './ledgerAccountPanel.scss'

export interface LedgerAccountStringOverrides {
  ledgerEntryDetail?: LedgerAccountEntryDetailsStringOverrides
  ledgerEntriesTable?: LedgerLineItemsTableStringOverrides
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
        <LedgerLineItemsTable
          pageSize={pageSize}
          stringOverrides={stringOverrides?.ledgerEntriesTable}
        />
      </VStack>
    </Panel>
  )
}
