export enum CustomAccountSubtype {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD',
}

export enum CustomAccountType {
  DEPOSITORY = 'DEPOSITORY',
  CREDIT = 'CREDIT',
}

export type RawCustomAccount = {
  id: string
  external_id: string | null
  mask: string | null
  account_name: string
  institution_name: string | null
  account_type: string
  account_subtype: string
  created_at: string | null
  updated_at: string | null
  archived_at: string | null
  ledger_account_id: string
}

export type CustomAccount = Pick<RawCustomAccount, 'id'> & {
  externalId: RawCustomAccount['external_id']
  mask: RawCustomAccount['mask']
  accountName: RawCustomAccount['account_name']
  institutionName: RawCustomAccount['institution_name']
  accountType: RawCustomAccount['account_type']
  accountSubtype: RawCustomAccount['account_subtype']
  createdAt: RawCustomAccount['created_at']
  updatedAt: RawCustomAccount['updated_at']
  archivedAt: RawCustomAccount['archived_at']
  ledgerAccountId: RawCustomAccount['ledger_account_id']
}
