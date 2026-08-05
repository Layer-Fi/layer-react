import { useContext } from 'react'

import { LedgerAccountsContext } from '@providers/features/generalLedger/LedgerAccountsContext/LedgerAccountsContext'
import { LedgerEntryDetails } from '@features/generalLedger/LedgerEntryDetails/LedgerEntryDetails'
import { type LedgerEntryDetailStringOverrides } from '@features/generalLedger/types'

export { LedgerEntrySourceDetailView } from '@blocks/LedgerEntry/LedgerEntrySourceDetailView/LedgerEntrySourceDetailView'

export type LedgerAccountEntryDetailsStringOverrides = LedgerEntryDetailStringOverrides

export const LedgerAccountEntryDetails = ({
  stringOverrides,
}: {
  stringOverrides?: LedgerAccountEntryDetailsStringOverrides
}) => {
  const { entryData, isLoadingEntry, closeSelectedEntry, isErrorEntry } =
    useContext(LedgerAccountsContext)

  return (
    <LedgerEntryDetails
      entry={entryData}
      isLoading={isLoadingEntry}
      isError={isErrorEntry}
      onClose={closeSelectedEntry}
      stringOverrides={stringOverrides}
    />
  )
}
