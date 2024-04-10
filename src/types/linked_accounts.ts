export interface LinkedAccounts {
  type: string
  external_accounts: LinkedAccount[]
}

export interface LinkedAccount {
  id: string
  external_account_name: string
  external_account_number: string
  latest_balance_timestamp: {
    external_account_external_id: string
    external_account_source: string
    balance: number
    at: string
    created_at: string
  }
  current_ledger_balance: number
  institution: string
  institutionLogo: string
}
