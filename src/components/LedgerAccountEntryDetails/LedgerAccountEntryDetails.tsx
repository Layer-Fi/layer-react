import { useContext } from 'react'

import { LedgerAccountsContext } from '@contexts/LedgerAccountsContext/LedgerAccountsContext'
import { LedgerEntryDetails } from '@components/LedgerEntryDetails/LedgerEntryDetails'
import { type LedgerEntryDetailsStringOverrides } from '@components/LedgerEntryDetails/types'

export { SourceDetailView } from '@components/LedgerEntryDetails/SourceDetailView'

export type LedgerAccountEntryDetailsStringOverrides = LedgerEntryDetailsStringOverrides

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
