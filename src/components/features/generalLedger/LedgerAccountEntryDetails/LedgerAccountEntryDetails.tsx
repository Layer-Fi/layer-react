import { useContext } from 'react'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { LedgerAccountsContext } from '@providers/features/generalLedger/LedgerAccountsContext/LedgerAccountsContext'
import { LedgerEntryDetails } from '@features/generalLedger/LedgerEntryDetails/LedgerEntryDetails'
import { type LedgerEntryDetailStringOverrides } from '@features/generalLedger/types'

/*
 * Journal and ledger-account details render the same `LedgerEntryDetails` now, so these are passed
 * down per caller rather than added to the shared component, which would put both features' names on
 * every entry detail view.
 */
const legacyClassNames = createLegacyClassNames({
  'details:root': 'Layer__ledger-account__entry-details',
  'details:header': 'Layer__ledger-account__entry-details__header',
  'details:lineItems': 'Layer__ledger-account__entry-details__line-items',
  'details:lineItemsTable': 'Layer__ledger-account__entry-details__table',
})

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
      legacyClassNames={{
        root: legacyClassNames('details:root'),
        header: legacyClassNames('details:header'),
        lineItems: legacyClassNames('details:lineItems'),
        lineItemsTable: legacyClassNames('details:lineItemsTable'),
      }}
    />
  )
}
