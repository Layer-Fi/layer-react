import { PlaidInstitution } from 'react-plaid-link'

export interface LinkedAccounts {
  type: string
  external_accounts: LinkedAccount[]
}

export interface LinkedAccount {
  id: string
  external_account_external_id: string
  external_account_source: string
  external_account_name: string
  latest_balance_timestamp: {
    external_account_external_id: string
    external_account_source: string
    balance: number
    at: string
    created_at: string
  }
  current_ledger_balance: number
  institution: {
    name: string
    logo: string
  }

  // Not added to API yet
  // external_account_number_last_four: string
  //connection_id: string
  //connection_status: string
}

export type PublicToken = {
  public_token: string
  institution_id: PlaidInstitution | null
}
