import { type NestedLedgerAccountType } from '@schemas/features/generalLedger/ledgerBalances'

export type AugmentedLedgerAccountBalance = NestedLedgerAccountType & { isMatching?: true }

export enum LedgerAccountNodeType {
  Leaf = 'Leaf',
  Root = 'Root',
  Parent = 'Parent',
}
