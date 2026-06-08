import { type LedgerEntryDirection } from '@schemas/generalLedger/ledgerAccount'
import { type LedgerAccountLineItem, type LedgerEntry } from '@schemas/generalLedger/ledgerEntry'

export const entryNumber = (entry: LedgerEntry): string =>
  entry.entryNumber?.toString() ?? entry.id.substring(0, 5)

export const sumLineItemAmountsByDirection = (
  lineItems: ReadonlyArray<{ amount: number, direction: LedgerEntryDirection }>,
  direction: LedgerEntryDirection,
): number =>
  lineItems
    .filter(item => item.direction === direction)
    .reduce((total, item) => total + item.amount, 0)

export const lineEntryNumber = (
  ledgerEntryLine: LedgerAccountLineItem,
): string => {
  return ledgerEntryLine.entryNumber?.toString() ?? ledgerEntryLine.entryId.substring(0, 5)
}
