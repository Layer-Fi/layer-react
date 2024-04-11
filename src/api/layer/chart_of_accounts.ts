import {
  Account,
  ChartOfAccounts,
  NewAccount,
  EditAccount,
  LedgerAccountLine,
  LedgerAccountEntry,
} from '../../types'
import { get, post, put } from './authenticated_http'

export const getChartOfAccounts = get<{ data: ChartOfAccounts }>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)

export const createAccount = post<{ data: Account }, NewAccount>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)

export const updateAccount = put<{ data: Account }, EditAccount>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/ledger/accounts/${accountId}`,
)

export const getLedgerAccountsLines = get<{ data: LedgerAccountLine[] }>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/ledger/accounts/${accountId}/lines`,
)

export const getLedgerAccountsEntry = get<{ data: LedgerAccountEntry }>(
  ({ businessId, entryId }) =>
    `/v1/businesses/${businessId}/ledger/entries/${entryId}`,
)
