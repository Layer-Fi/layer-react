import type { CustomerSchema } from '../../../../../customers/customersSchemas'
import type { VendorSchema } from '../../../../../vendors/vendorsSchemas'

type SetMetadataOnLedgerEntryArg = {
  vendor: typeof VendorSchema.Type | null
  customer: typeof CustomerSchema.Type | null
}

type UseSetMetadataOnLedgerEntryParameters = {
  ledgerEntryId: string
}

export function useSetMetadataOnLedgerEntry({
  ledgerEntryId: _ledgerEntryId,
}: UseSetMetadataOnLedgerEntryParameters) {
  /**
   * @TODO - Not yet implemented
   */

  return {
    trigger: (_arg: SetMetadataOnLedgerEntryArg) => Promise.resolve(),
    isMutating: false,
  }
}
