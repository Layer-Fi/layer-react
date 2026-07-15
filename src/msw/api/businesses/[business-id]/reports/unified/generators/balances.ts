import { LedgerAccountType, LedgerEntryDirection, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'

import {
  accountsOfTypes,
  accountStreamKey,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  accountMagnitude,
  entryStreamOptionsFromParams,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import { sumAmountCentsInRange } from '@fixtures/unifiedReports/deterministicAmounts'

const BALANCE_SHEET_TYPES = [LedgerAccountType.Asset, LedgerAccountType.Liability, LedgerAccountType.Equity] as const

export const RETAINED_EARNINGS_STABLE_NAME = 'RETAINED_EARNINGS'
export const OPENING_BALANCE_EQUITY_STABLE_NAME = 'OPENING_BALANCE_EQUITY'

// Balances accumulate from a fixed inception so an as-of date carries prior-year history.
const inceptionFor = (effectiveDate: Date) => new Date(effectiveDate.getFullYear() - 2, 0, 1)

/*
 * Positive magnitude of an account's accumulated activity through the effective
 * date. Balance-sheet/trial-balance math places this on the account's normal
 * side, so the sign lives in the column, not the number.
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

export const isDebitNormal = (account: SingleChartAccountType) =>
  account.normality === LedgerEntryDirection.Debit

export const balanceSheetAccounts = (): SingleChartAccountType[] =>
  accountsOfTypes(BALANCE_SHEET_TYPES)

// Retained earnings mirrors cumulative net income so the balance sheet identity holds.
export const cumulativeNetIncomeCents = (effectiveDate: Date, params: URLSearchParams): number => {
  const revenue = accountsOfTypes([LedgerAccountType.Revenue])
    .reduce((total, account) => total + signedAccumulated(account, effectiveDate, params), 0)
  const expenses = accountsOfTypes([LedgerAccountType.Expense])
    .reduce((total, account) => total + signedAccumulated(account, effectiveDate, params), 0)

  return revenue - expenses
}

const signedAccumulated = (account: SingleChartAccountType, effectiveDate: Date, params: URLSearchParams) => {
  const magnitude = accumulatedMagnitudeCents(account, effectiveDate, params)
  const isContra = account.accountType.value === LedgerAccountType.Revenue
    ? account.normality === LedgerEntryDirection.Debit
    : account.normality === LedgerEntryDirection.Credit
  return isContra ? -magnitude : magnitude
}
