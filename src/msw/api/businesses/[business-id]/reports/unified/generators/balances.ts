import { LedgerAccountType, LedgerEntryDirection, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'

import {
  accountActivityCents,
  accountStreamKey,
  leafAccountsOfTypes,
  sumActivityCents,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  accountMagnitude,
  entryStreamOptionsFromParams,
  type ReportDateRange,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import { sumAmountCentsInRange } from '@fixtures/unifiedReports/deterministicAmounts'

const BALANCE_SHEET_TYPES = [LedgerAccountType.Asset, LedgerAccountType.Liability, LedgerAccountType.Equity] as const

export const RETAINED_EARNINGS_STABLE_NAME = 'RETAINED_EARNINGS'
export const OPENING_BALANCE_EQUITY_STABLE_NAME = 'OPENING_BALANCE_EQUITY'

// Balances accumulate from a fixed inception so an as-of date carries prior-year history.
const inceptionFor = (effectiveDate: Date) => new Date(effectiveDate.getFullYear() - 2, 0, 1)

// The exact window a balance accumulates over, so drill-downs can cover the same span and reconcile.
export const balanceSheetRange = (effectiveDate: Date): ReportDateRange => ({
  startDate: inceptionFor(effectiveDate),
  endDate: effectiveDate,
})

/*
 * Positive magnitude of a leaf account's accumulated activity through the
 * effective date. The trial balance places this on the account's normal side,
 * so the sign lives in the column, not the number.
 */
export const accumulatedMagnitudeCents = (
  account: SingleChartAccountType,
  effectiveDate: Date,
  params: URLSearchParams,
): number => sumAmountCentsInRange(
  accountStreamKey(account),
  inceptionFor(effectiveDate),
  effectiveDate,
  entryStreamOptionsFromParams(params, accountMagnitude(account)),
)

/*
 * Signed leaf balance for the balance sheet: contra accounts (accumulated
 * depreciation, distributions) subtract from their section, matching how the
 * P&L signs the same accounts.
 */
export const leafBalanceCents = (
  account: SingleChartAccountType,
  effectiveDate: Date,
  params: URLSearchParams,
): number => accountActivityCents(account, { startDate: inceptionFor(effectiveDate), endDate: effectiveDate }, params)

export const isDebitNormal = (account: SingleChartAccountType) =>
  account.normality === LedgerEntryDirection.Debit

// Leaf accounts only: parent rows are pure subtotals, so summing them too would double-count.
export const balanceSheetLeafAccounts = (): SingleChartAccountType[] =>
  leafAccountsOfTypes(BALANCE_SHEET_TYPES)

// Net income over an exact range, summing leaf revenue minus leaf expense (same basis as P&L net profit).
export const netIncomeInRange = (range: ReportDateRange, params: URLSearchParams): number =>
  sumActivityCents(leafAccountsOfTypes([LedgerAccountType.Revenue]), range, params)
  - sumActivityCents(leafAccountsOfTypes([LedgerAccountType.Expense]), range, params)

// Retained earnings mirrors cumulative net income so the balance sheet identity holds.
export const cumulativeNetIncomeCents = (effectiveDate: Date, params: URLSearchParams): number =>
  netIncomeInRange({ startDate: inceptionFor(effectiveDate), endDate: effectiveDate }, params)
