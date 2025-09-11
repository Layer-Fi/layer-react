import { Direction } from './bank_transactions'
import { LedgerEntryDirection, NestedLedgerAccountType } from '../schemas/generalLedger/ledgerAccount'

export type ApiAccountType = {
  value: string
  display_name: string
}

export type LedgerAccountBalance = {
  id: string
  name: string
  stable_name: string
  account_number: string | null
  account_type: ApiAccountType
  account_subtype?: ApiAccountType
  normality: LedgerEntryDirection
  balance: number
  is_deletable: boolean
  sub_accounts: LedgerAccountBalance[]
}

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
