import { describe, expect, it } from 'vitest'

import * as publicApi from './index'

// The public surface is the package's contract. Snapshotting it means removing or renaming an
// export shows up as a failing test in review instead of as a breaking change in a consumer's
// build. Adding an export is an intentional one-line update here.
describe('public API', () => {
  it('exports a stable set of names', () => {
    expect(Object.keys(publicApi).sort()).toMatchInlineSnapshot(`
      [
        "AccountingOverview",
        "BalanceSheet",
        "BankTransactions",
        "BankTransactionsWithLinkedAccounts",
        "BookkeepingOverview",
        "ChartOfAccounts",
        "Direction",
        "DisplayState",
        "EntityName",
        "GeneralLedgerView",
        "GlobalDateRangeSelection",
        "GlobalMonthPicker",
        "Invoices",
        "Journal",
        "LandingPage",
        "LayerEventComponent",
        "LayerEventType",
        "LayerProvider",
        "LinkAccounts",
        "LinkedAccounts",
        "MileageSummaryCard",
        "MileageTracking",
        "ProfitAndLoss",
        "Reports",
        "SolopreneurOverview",
        "StatementOfCashFlow",
        "SupportedLocale",
        "Tasks",
        "TaxEstimates",
        "TimeTracking",
        "UnifiedReports",
        "useLayerContext",
      ]
    `)
  })
})
