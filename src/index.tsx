/*
==========================================================
======================= Components =======================
==========================================================
*/

/* ------------------ Onboarding ------------------ */
export { Onboarding } from './components/Onboarding'

/* ------------------ Bank Accounts & Transactions ------------------ */
export { LinkedAccounts } from './components/LinkedAccounts'
export { BankTransactions } from './components/BankTransactions/BankTransactions'
export { Integrations } from './components/Integrations/Integrations'

/* ------------------ Reporting ------------------ */
export { ProfitAndLoss } from './components/ProfitAndLoss/ProfitAndLoss'
/* Profit and loss contains 6 sub-components:
 * - Chart
 * - DatePicker
 * - Summaries
 * - DetailedCharts
 * - Header
 * - Report
 */
export { StandaloneBalanceSheet as BalanceSheet } from './components/BalanceSheet'
export { StandaloneStatementOfCashFlow as StatementOfCashFlow } from './components/StatementOfCashFlow'

/* ------------------ Ledger ------------------ */
export { ChartOfAccounts } from './components/ChartOfAccounts'
export { Journal } from './components/Journal'

/* ------------------ Account Operations ------------------ */
export { Tasks } from './components/Tasks/Tasks'

/* --------------------- Onboarding ------------------------ */
export { LandingPage } from './components/LandingPage/LandingPage'
export { LinkAccounts } from './components/PlatformOnboarding/LinkAccounts'
export { PlatformOnboarding } from './components/PlatformOnboarding/PlatformOnboarding'

/* --------------------- Banners -------------------------- */
export { BookkeepingUpsellBar } from './components/BookkeepingUpsellBar'

/*
======================= Composite Views =======================
*/
export { BookkeepingOverview } from './views/BookkeepingOverview'
export { AccountingOverview } from './views/AccountingOverview'
export { BankTransactionsWithLinkedAccounts } from './views/BankTransactionsWithLinkedAccounts'
export { GeneralLedgerView } from './views/GeneralLedger'
export { ProjectProfitabilityView } from './views/ProjectProfitability'
export { unstable_BillsView } from './views/Bills'
export { UnifiedReport as unstable_UnifiedReports } from './components/UnifiedReport/UnifiedReport'
export { Reports } from './views/Reports'
export { ProfitAndLossView } from './components/ProfitAndLossView'
export { Invoices } from './components/Invoices/Invoices'

/*
======================= Layer Provider & Context =======================
*/
export { LayerProvider } from './providers/LayerProvider'
export { useLayerContext } from './contexts/LayerContext'

export { DisplayState } from './types/bank_transactions'
export { Direction } from './types/general'
export { type LinkingMetadata, EntityName } from './contexts/InAppLinkContext'
