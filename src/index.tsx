export { LayerProvider } from './providers/LayerProvider'

/*
==========================================================
======================= Components =======================
==========================================================
*/

/* ------------------ Onboarding ------------------ */
export { Onboarding } from './components/Onboarding'

/* ------------------ Reporting ------------------ */
export { ProfitAndLoss } from './components/ProfitAndLoss'
/* Profit and loss contains 6 sub-components:
 * - Chart
 * - Context
 * - DatePicker
 * - Summaries
 * - Table
 * - DetailedCharts
 */
export { BalanceSheet } from './components/BalanceSheet'

/* ------------------ Bank Accounts & Transactions ------------------ */
export { LinkedAccounts } from './components/LinkedAccounts'
export { BankTransactions } from './components/BankTransactions'

/* ------------------ Ledger ------------------ */
export { ChartOfAccounts } from './components/ChartOfAccounts'
export { Journal } from './components/Journal'

/* ------------------ Account Operations ------------------ */
export { Tasks } from './components/Tasks'

/*
======================= Composite Views =======================
*/
export { AccountingOverview } from './views/AccountingOverview'
export { BankTransactionsWithLinkedAccounts } from './views/BankTransactionsWithLinkedAccounts'
export { GeneralLedgerView } from './views/GeneralLedger'
export { Reports } from './views/Reports'
export { ProfitAndLossView } from './components/ProfitAndLossView'

/*
======================= Hooks & Contexts =======================
*/
export { useLayerContext } from './contexts/LayerContext'
export { useBankTransactionsContext } from './contexts/BankTransactionsContext'
