import { describe, expect, it } from 'vitest'

import * as publicApi from './index'

// A removed or renamed export fails here in review rather than in a consumer's build. Adding one
// is an intentional update to this snapshot.
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
