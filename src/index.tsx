/*
==========================================================
======================= Components =======================
==========================================================
*/

/* ------------------ Onboarding ------------------ */
export { Onboarding } from './components/Onboarding/Onboarding'

/* ------------------ Bank Accounts & Transactions ------------------ */
export { BankTransactions } from './components/BankTransactions/BankTransactions'
export { Integrations } from './components/Integrations/Integrations'
export { LinkedAccounts } from './components/LinkedAccounts/LinkedAccounts'

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
export { LinkAccounts } from './components/LinkAccounts/LinkAccounts'

/* --------------------- Banners -------------------------- */
export { BookkeepingUpsellBar } from './components/BookkeepingUpsellBar/BookkeepingUpsellBar'

/* --------------------- Date Pickers -------------------------- */
export { GlobalDateRangeSelection } from './components/DateSelection/GlobalDateRangeSelection'
export { GlobalMonthPicker } from './components/GlobalMonthPicker/GlobalMonthPicker'

/* --------------------- Cards -------------------------- */
export { MileageSummaryCard as unstable_MileageSummaryCard } from './components/MileageSummaryCard/MileageSummaryCard'

/*
======================= Composite Views =======================
*/
export { Invoices } from './components/Invoices/Invoices'
export { ProfitAndLossView } from './components/ProfitAndLossView/ProfitAndLossView'
export { UnifiedReport as unstable_UnifiedReports } from './components/UnifiedReport/UnifiedReport'
export { AccountingOverview } from './views/AccountingOverview/AccountingOverview'
export { BankTransactionsWithLinkedAccounts } from './views/BankTransactionsWithLinkedAccounts/BankTransactionsWithLinkedAccounts'
export { BookkeepingOverview } from './views/BookkeepingOverview/BookkeepingOverview'
export { GeneralLedgerView } from './views/GeneralLedger/GeneralLedger'
export { unstable_MileageTracking } from './views/MileageTracking'
export { ProjectProfitabilityView } from './views/ProjectProfitability/ProjectProfitability'
export { Reports } from './views/Reports/Reports'
export { TaxEstimatesView } from './views/TaxEstimates/TaxEstimates'

/*
======================= Layer Provider & Context =======================
*/
export { EntityName, type LinkingMetadata } from './contexts/InAppLinkContext'
export { useLayerContext } from './contexts/LayerContext/LayerContext'
export { LayerProvider } from './providers/LayerProvider/LayerProvider'
export { DisplayState } from './types/bankTransactions'
export { Direction } from './types/general'
