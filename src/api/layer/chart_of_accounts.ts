import {
  NewAccount,
  EditAccount,
  NewChildAccount,
} from '../../types'
import { ChartOfAccounts, LedgerBalances, LedgerAccount } from '../../schemas/generalLedger/ledgerAccount'
import { LedgerAccountLineItem, LedgerEntry } from '../../schemas/generalLedger/ledgerEntry'
import { S3PresignedUrl } from '../../types/general'
import { get, post, put } from './authenticated_http'

export const getChartOfAccounts = get<{ data: ChartOfAccounts }>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)

export const getLedgerAccountBalances = get<{ data: LedgerBalances }>(
  ({ businessId, startDate, endDate }) =>
    `/v1/businesses/${businessId}/ledger/balances?${
      startDate ? `&start_date=${encodeURIComponent(startDate)}` : ''
    }${endDate ? `&end_date=${encodeURIComponent(endDate)}` : ''}`,
)

export const createAccount = post<{ data: LedgerAccount }, NewAccount>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)

export const updateAccount = put<{ data: LedgerAccount }, EditAccount>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/ledger/accounts/${accountId}`,
)

export const createChildAccount = post<{ data: LedgerAccount }, NewChildAccount>(
  ({ businessId, accountId }) => `/v1/businesses/${businessId}/ledger/accounts/${accountId}/create-child-account`,
)

export const getLedgerAccountsLines = get<{ data: LedgerAccountLineItem[] }>(
  ({ businessId, accountId, includeReversals }) =>
    `/v1/businesses/${businessId}/ledger/accounts/${accountId}/lines${
      includeReversals === 'true' ? '?include_reversals=true' : ''
    }`,
)

export const getLedgerAccountsEntry = get<{ data: LedgerEntry }>(
  ({ businessId, entryId }) =>
    `/v1/businesses/${businessId}/ledger/entries/${entryId}`,
)

export const getLedgerAccountBalancesCSV = get<{ data: S3PresignedUrl }>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/balances/exports/csv`,
)
