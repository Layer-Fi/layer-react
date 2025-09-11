import { Direction } from './bank_transactions'
import { NestedLedgerAccountType } from '../schemas/generalLedger/ledgerAccount'

export type AugmentedLedgerAccountBalance = NestedLedgerAccountType & { isMatching?: true }

export type NewAccount = {
  name: string
  account_number?: string
  normality: Direction
  parent_id?: {
    type: 'AccountId'
    id: string
  }
  account_type: string
  account_subtype?: string
}

export type EditAccount = {
  stable_name?: {
    type: 'StableName'
    stable_name: string
  }
  name: string
  account_number?: string
  normality: Direction
  parent_id?: {
    type: 'AccountId'
    id: string
  }
  account_type: string
  account_subtype?: string
}

export type NewChildAccount = {
  name: string
  stable_name?: {
    type: 'StableName'
    stable_name: string
  }
}

export enum LedgerAccountNodeType {
  Leaf = 'Leaf',
  Root = 'Root',
  Parent = 'Parent',
}

export type LedgerAccountBalanceWithNodeType = NestedLedgerAccountType & {
  nodeType: LedgerAccountNodeType
}
