export type SortDirection = 'asc' | 'desc'

export interface BaseSelectOption {
  label: string
  value: string | number
}

export interface S3PresignedUrl {
  type: 'S3_Presigned_Url'
  presignedUrl: string
  fileType: string
}

export type LoadedStatus = 'initial' | 'loading' | 'complete'

export enum DataModel {
  BUSINESS = 'BUSINESS',
  BALANCE_SHEET = 'BALANCE_SHEET',
  BANK_TRANSACTIONS = 'BANK_TRANSACTIONS',
  CHART_OF_ACCOUNTS = 'CHART_OF_ACCOUNTS',
  JOURNAL = 'JOURNAL',
  LEDGER_ACCOUNTS = 'LEDGER_ACCOUNTS',
  LINKED_ACCOUNTS = 'LINKED_ACCOUNTS',
  PROFIT_AND_LOSS = 'PROFIT_AND_LOSS',
  STATEMENT_OF_CASH_FLOWS = 'STATEMENT_OF_CASH_FLOWS',
  TASKS = 'TASKS',
}
