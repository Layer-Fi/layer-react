// Must stay the first import: global CSS has to precede component CSS in the generated
// stylesheet so component styles win on equal specificity.
import './styles/index.scss'

/*
==========================================================
======================= Components =======================
==========================================================
*/

/* ------------------ Bank Accounts & Transactions ------------------ */
export { BankTransactions } from './components/features/bankTransactions/BankTransactions/BankTransactions'
export { LinkedAccounts } from './components/features/linkedAccounts/LinkedAccounts/LinkedAccounts'

/* ------------------ Reporting ------------------ */
export { ProfitAndLoss } from './components/features/profitAndLoss/ProfitAndLoss/ProfitAndLoss'
/* Profit and loss contains 5 sub-components:
 * - Chart
 * - Summaries
 * - DetailedCharts
 * - Header
 * - Report
 */
export { BalanceSheet } from './components/features/balanceSheet/BalanceSheet/BalanceSheet'
export { StatementOfCashFlow } from './components/features/cashflowStatement/StatementOfCashFlow/StatementOfCashFlow'

/* ------------------ Ledger ------------------ */
export { ChartOfAccounts } from './components/features/generalLedger/ChartOfAccounts/ChartOfAccounts'
export { Journal } from './components/features/generalLedger/Journal/Journal'

/* ------------------ Account Operations ------------------ */
export { Tasks } from './components/features/bookkeeping/Tasks/Tasks'

/* --------------------- Onboarding ------------------------ */
export { LinkAccounts } from './components/features/linkedAccounts/LinkAccounts/LinkAccounts'
export { LandingPage } from './views/LandingPage/LandingPage'

/* --------------------- Date Pickers -------------------------- */
export { GlobalDateRangeSelection } from './components/blocks/DatePickers/DateSelection/GlobalDateRangeSelection'
export { GlobalMonthPicker } from './components/blocks/DatePickers/GlobalMonthPicker/GlobalMonthPicker'

/* --------------------- Cards -------------------------- */
export { MileageSummaryCard } from './components/features/mileage/MileageSummaryCard/MileageSummaryCard'

/*
======================= Composite Views =======================
*/
export { AccountingOverview } from './views/AccountingOverview/AccountingOverview'
export { BankTransactionsWithLinkedAccounts } from './views/BankTransactionsWithLinkedAccounts/BankTransactionsWithLinkedAccounts'
export { BookkeepingOverview } from './views/BookkeepingOverview/BookkeepingOverview'
export { GeneralLedgerView } from './views/GeneralLedger/GeneralLedger'
export { Invoices } from './views/Invoices/Invoices'
export { MileageTracking } from './views/MileageTracking/MileageTracking'
export { Reports } from './views/Reports/Reports'
export { SolopreneurOverview } from './views/SolopreneurOverview/SolopreneurOverview'
export { TaxEstimates } from './views/TaxEstimates/TaxEstimates'
export { TimeTracking } from './views/TimeTracking/TimeTracking'
export { UnifiedReports } from './views/UnifiedReports/UnifiedReports'

/*
======================= Layer Provider & Context =======================
*/
export { EntityName, type LinkingMetadata } from './providers/common/InAppLink/InAppLinkContext'
export { useLayerContext } from './providers/global/LayerContext/LayerContext'
export { type EventCallbacks, LayerProvider } from './providers/global/LayerProvider/LayerProvider'
export { type LayerEvent, LayerEventComponent, LayerEventType } from './schemas/common/layerEvents'
export { DisplayState } from './types/features/bankTransactions/bankTransaction'
export { Direction } from './types/shared/money'
export { SupportedLocale } from './utils/shared/i18n/supportedLocale'
