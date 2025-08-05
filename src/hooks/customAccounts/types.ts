import { Direction } from '../../types/bank_transactions'

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
  user_created: boolean
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
  userCreated: RawCustomAccount['user_created']
}

export const mapRawCustomAccountToCustomAccount = (raw: RawCustomAccount): CustomAccount => ({
  id: raw.id,
  externalId: raw.external_id,
  mask: raw.mask,
  accountName: raw.account_name,
  institutionName: raw.institution_name,
  accountType: raw.account_type,
  accountSubtype: raw.account_subtype,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
  archivedAt: raw.archived_at,
  ledgerAccountId: raw.ledger_account_id,
  userCreated: raw.user_created,
})

export type RawCustomTransaction = {
  external_id?: string | null
  amount: number
  direction: Direction
  date: string
  description: string
  reference_number?: string | null
}

export interface CustomAccountTransactionRow {
  date: string
  description: string
  amount: number
  external_id?: string | null
  reference_number?: string | null
}
