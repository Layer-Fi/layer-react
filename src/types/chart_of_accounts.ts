import { Direction } from './bank_transactions'
import { Category } from './categories'

export interface ChartOfAccounts {
  type: string
  accounts: Account[]
  entries?: any[]
}

export interface AccountEntry {
  account: Account
  amount?: number
  createdAt?: string
  direction: Direction
  entry_at?: string
  entry_id?: string
  id?: string
}

export interface Account {
  id: string
  number: number
  pnlCategory?: Category
  headerForPnlCategory?: Category
  name: string
  accountStableName?: string
  description?: string
  scheduleCLine?: string
  scheduleCLineDescription?: string
  sub_accounts?: Account[]
  hidePnl: boolean
  showInPnlIfEmpty: boolean
  normality: Direction
  balance: number
  selfOnlyBalance: number
  entries?: AccountEntry[]
}

export type NewAccount = {
  name: string
  normality: Direction
  parent_id?: {
    type: 'AccountId'
    id: string
  }
  description: string
}

export type EditAccount = {
  name: string
  stable_name: string
  normality: Direction
  parent_id?: {
    type: 'AccountId'
    id: string
  }
  description: string
}

export interface LedgerAccountEntry {}

export interface LedgerAccountLine {
  type: string
  id: string
  entry_id: string
  account: any // @TODO - replace any-s
  amount: number
  direction: Direction
  date: string
  transaction: any
  //  {
  //   id: '87f1f97f-b622-4749-9ad6-8893c8a7e4a4'
  //   business_id: 'ce9b26ae-0908-415a-8aa5-0e0172a31d6a'
  //   source: 'PLAID'
  //   source_transaction_id: 'jmErZz4or1U5v1kyZEVLuQg605RBmYIv14r13-40178'
  //   source_account_id: 'ZVEwqY6RwjT3E79AgRZEf7MqkANoV8tz4bjmX'
  //   imported_at: '2024-02-06T01:10:04.836487Z'
  //   date: '2024-02-02T05:00:00Z'
  //   direction: 'DEBIT'
  //   amount: 130308
  //   counterparty_name: null
  //   description: 'ORIG CO NAME:GUSTO ORIG ID:9138864001 DESC DATE:240202 CO ENTRY DESCR:TAX 284473SEC:CCD TRACE#:021000023699972 EED:240202 IND ID:6semk09id88 IND NAME:ReJHUvenate Aesthetics 6semjn1oq7p TRN: 0333699972TC'
  //   account_name: 'BUS COMPLETE CHK'
  //   categorization_status: 'SPLIT'
  //   category: {
  //     type: 'Split_Categorization'
  //     entries: [
  //       {
  //         amount: 130308
  //         category: {
  //           id: '86a88b05-4238-4e67-8eef-10018e4c255a'
  //           stable_name: 'DEPRECIATION_EXPENSE'
  //           category: '86a88b05-4238-4e67-8eef-10018e4c255a'
  //           display_name: 'Depreciation Expense'
  //         }
  //       },
  //       {
  //         amount: 0
  //         category: {
  //           id: '5c6bf373-9f4f-4a13-aa18-e8bf888393fb'
  //           stable_name: 'ASK_MY_ACCOUNTANT'
  //           category: '5c6bf373-9f4f-4a13-aa18-e8bf888393fb'
  //           display_name: 'Ask My Accountant'
  //         }
  //       },
  //     ]
  //   }
  //   categorization_method: 'API'
  //   categorization_flow: {
  //     type: 'LAYER_REVIEW'
  //   }
  //   categorization_ux: {
  //     options: [
  //       {
  //         type: 'MENU'
  //         name: 'BUSINESS'
  //         display_string: 'Business'
  //         menu_options: [
  //           {
  //             type: 'FREE_SELECT'
  //             name: 'FREE_SELECT'
  //             display_string: 'Something else'
  //           },
  //         ]
  //       },
  //       {
  //         type: 'CATEGORIZE'
  //         name: 'PERSONAL'
  //         display_string: 'Personal'
  //         account: {
  //           type: 'Exclusion'
  //           id: 'PERSONAL_EXPENSES'
  //           category: 'PERSONAL_EXPENSES'
  //           display_name: 'Personal transactions'
  //         }
  //       },
  //       {
  //         type: 'SPLIT'
  //         name: 'SPLIT'
  //         display_string: 'Split'
  //       },
  //     ]
  //   }
  //   projected_income_category: 'EXPENSE'
  //   suggested_matches: []
  //   match: null
  //   transaction_tags: []
  // }
  invoice: string | null
}
