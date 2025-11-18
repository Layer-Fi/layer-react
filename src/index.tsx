/*
==========================================================
======================= Components =======================
==========================================================
*/

/* ------------------ Onboarding ------------------ */
export { Onboarding } from './components/Onboarding/Onboarding'

/* ------------------ Bank Accounts & Transactions ------------------ */
export { LinkedAccounts } from './components/LinkedAccounts/LinkedAccounts'
export { BankTransactions } from './components/BankTransactions/BankTransactions'
export { Integrations } from './components/Integrations/Integrations'

/* ------------------ Reporting ------------------ */
export { ProfitAndLoss } from './components/ProfitAndLoss/ProfitAndLoss'
/* Profit and loss contains 5 sub-components:
 * - Chart
 * - Summaries
 * - DetailedCharts
 * - Header
 * - Report
 */
export { BalanceSheet } from './components/BalanceSheet/BalanceSheet'
export { StatementOfCashFlow } from './components/StatementOfCashFlow/StatementOfCashFlow'

/* ------------------ Ledger ------------------ */
export { ChartOfAccounts } from './components/ChartOfAccounts/ChartOfAccounts'
export { Journal } from './components/Journal/Journal'

/* ------------------ Account Operations ------------------ */
export { Tasks } from './components/Tasks/Tasks'

/* --------------------- Onboarding ------------------------ */
export { LandingPage } from './components/LandingPage/LandingPage'
export { LinkAccounts } from './components/PlatformOnboarding/LinkAccounts'
export { PlatformOnboarding } from './components/PlatformOnboarding/PlatformOnboarding'

/* --------------------- Banners -------------------------- */
export { BookkeepingUpsellBar } from './components/BookkeepingUpsellBar/BookkeepingUpsellBar'

/*
======================= Composite Views =======================
*/
export { BookkeepingOverview } from './views/BookkeepingOverview/BookkeepingOverview'
export { AccountingOverview } from './views/AccountingOverview/AccountingOverview'
export { BankTransactionsWithLinkedAccounts } from './views/BankTransactionsWithLinkedAccounts/BankTransactionsWithLinkedAccounts'
export { GeneralLedgerView } from './views/GeneralLedger/GeneralLedger'
export { TaxFilingView as unstable_TaxFilingView } from './views/TaxFiling/TaxFilingView'
export { ProjectProfitabilityView } from './views/ProjectProfitability/ProjectProfitability'
export { unstable_BillsView } from './views/Bills'
export { UnifiedReport as unstable_UnifiedReports } from './components/UnifiedReport/UnifiedReport'
export { Reports } from './views/Reports/Reports'
export { ProfitAndLossView } from './components/ProfitAndLossView/ProfitAndLossView'
export { Invoices } from './components/Invoices/Invoices'
export { unstable_MileageTracking } from './views/MileageTracking'

/*
======================= Layer Provider & Context =======================
*/
export { LayerProvider } from './providers/LayerProvider/LayerProvider'
export { useLayerContext } from './contexts/LayerContext/LayerContext'

export { DisplayState } from './types/bank_transactions'
export { Direction } from './types/general'
export { type LinkingMetadata, EntityName } from './contexts/InAppLinkContext'
