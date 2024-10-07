import { authenticate } from './layer/authenticate'
import { getBalanceSheet } from './layer/balance_sheet'
import {
  getBankTransactions,
  categorizeBankTransaction,
  matchBankTransaction,
  getBankTransactionsCsv,
  getBankTransactionMetadata,
  updateBankTransactionMetadata,
  listBankTransactionDocuments,
  uploadBankTransactionDocument,
  getBankTransactionDocument,
  archiveBankTransactionDocument,
} from './layer/bankTransactions'
import { getBusiness } from './layer/business'
import { getCategories } from './layer/categories'
import {
  getChartOfAccounts,
  getLedgerAccountBalances,
  createAccount,
  updateAccount,
  getLedgerAccountsLines,
  getLedgerAccountsEntry,
} from './layer/chart_of_accounts'
import { getJournal, createJournalEntries } from './layer/journal'
import {
  getLinkedAccounts,
  getPlaidLinkToken,
  getPlaidUpdateModeLinkToken,
  exchangePlaidPublicToken,
  unlinkPlaidItem,
  unlinkAccount,
  confirmConnection,
  denyConnection,
  breakPlaidItemConnection,
  syncConnection,
  updateConnectionStatus,
} from './layer/linked_accounts'
import {
  getProfitAndLoss,
  getProfitAndLossSummaries,
  getProfitAndLossCsv,
  compareProfitAndLoss,
  profitAndLossComparisonCsv,
} from './layer/profit_and_loss'
import {
  syncFromQuickbooks,
  statusOfSyncFromQuickbooks,
  initQuickbooksOAuth,
  statusOfQuickbooksConnection,
  unlinkQuickbooksConnection,
} from './layer/quickbooks'
import { getStatementOfCashFlow } from './layer/statement-of-cash-flow'
import {
  getTasks,
  submitResponseToTask,
  completeTaskWithUpload,
} from './layer/tasks'

export const Layer = {
  authenticate,
  getBusiness,
  categorizeBankTransaction,
  matchBankTransaction,
  createAccount,
  updateAccount,
  getBalanceSheet,
  getBankTransactions,
  getBankTransactionsCsv,
  getBankTransactionMetadata,
  listBankTransactionDocuments,
  getBankTransactionDocument,
  archiveBankTransactionDocument,
  updateBankTransactionMetadata,
  uploadBankTransactionDocument,
  getCategories,
  getChartOfAccounts,
  getLedgerAccountBalances,
  getLedgerAccountsLines,
  getLedgerAccountsEntry,
  getProfitAndLoss,
  getProfitAndLossSummaries,
  getProfitAndLossCsv,
  getLinkedAccounts,
  getJournal,
  compareProfitAndLoss,
  profitAndLossComparisonCsv,
  createJournalEntries,
  getPlaidLinkToken,
  getPlaidUpdateModeLinkToken,
  exchangePlaidPublicToken,
  unlinkAccount,
  unlinkPlaidItem,
  confirmConnection,
  denyConnection,
  getTasks,
  completeTaskWithUpload,
  submitResponseToTask,
  breakPlaidItemConnection,
  syncConnection,
  updateConnectionStatus,
  getStatementOfCashFlow,
  syncFromQuickbooks,
  statusOfSyncFromQuickbooks,
  statusOfQuickbooksConnection,
  initQuickbooksOAuth,
  unlinkQuickbooksConnection,
}
