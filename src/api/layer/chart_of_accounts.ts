import { SingleChartAccountEncodedType } from '../../schemas/generalLedger/ledgerAccount'
import {
  NewAccount,
  EditAccount,
  NewChildAccount,
  LedgerAccountsEntry,
} from '../../types'
import { S3PresignedUrl } from '../../types/general'
import { LedgerAccountLineItems } from '../../types/ledger_accounts'
import { get, post, put } from './authenticated_http'

export const createAccount = post<{ data: SingleChartAccountEncodedType }, NewAccount>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)

export const updateAccount = put<{ data: SingleChartAccountEncodedType }, EditAccount>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/ledger/accounts/${accountId}`,
)

export const createChildAccount = post<{ data: SingleChartAccountEncodedType }, NewChildAccount>(
  ({ businessId, accountId }) => `/v1/businesses/${businessId}/ledger/accounts/${accountId}/create-child-account`,
)

export const getLedgerAccountsLines = get<{ data: LedgerAccountLineItems }>(
  ({ businessId, accountId, includeReversals }) =>
    `/v1/businesses/${businessId}/ledger/accounts/${accountId}/lines${
      includeReversals === 'true' ? '?include_reversals=true' : ''
    }`,
)

export const getLedgerAccountsEntry = get<{ data: LedgerAccountsEntry }>(
  ({ businessId, entryId }) =>
    `/v1/businesses/${businessId}/ledger/entries/${entryId}`,
)

export const getLedgerAccountBalancesCSV = get<{ data: S3PresignedUrl }>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/balances/exports/csv`,
)
