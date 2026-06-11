import { type NestedLedgerAccountType } from '@schemas/generalLedger/ledgerAccount'

export type AugmentedLedgerAccountBalance = NestedLedgerAccountType & { isMatching?: true }

export enum LedgerAccountNodeType {
  Leaf = 'Leaf',
  Root = 'Root',
  Parent = 'Parent',
}

export type LedgerAccountBalanceWithNodeType = NestedLedgerAccountType & {
  nodeType: LedgerAccountNodeType
}
