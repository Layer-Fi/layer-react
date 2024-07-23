import { PlaidInstitution } from 'react-plaid-link'

export interface LinkedAccounts {
  type: string
  external_accounts: LinkedAccount[]
}

export interface LinkedAccount {
  id: string
  external_account_external_id: string
  external_account_source: Source
  external_account_name: string
  latest_balance_timestamp: {
    external_account_external_id: string
    external_account_source: Source
    balance: number
    at: string
    created_at: string
  }
  current_ledger_balance: number
  institution: {
    name: string
    logo: string | null
  }
  mask?: string
  connection_id?: string
  connection_external_id?: string
  connection_needs_repair_as_of: string | null
  requires_user_confirmation_as_of: string | null
  created_at: string
}

export type PublicToken = {
  public_token: string
  institution: PlaidInstitution | null
}

export type Source = 'PLAID' | 'STRIPE'
