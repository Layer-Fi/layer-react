import { authenticate } from './layer/authenticate'
import { getBalanceSheet } from './layer/balance_sheet'
import {
  getBankTransactions,
  categorizeBankTransaction,
  matchBankTransaction,
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
} from './layer/linked_accounts'
import {
  getProfitAndLoss,
  getProfitAndLossSummaries,
} from './layer/profit_and_loss'
import { getTasks, submitResponseToTask } from './layer/tasks'

export const Layer = {
  authenticate,
  getBusiness,
  categorizeBankTransaction,
  matchBankTransaction,
  createAccount,
  updateAccount,
  getBalanceSheet,
  getBankTransactions,
  getCategories,
  getChartOfAccounts,
  getLedgerAccountBalances,
  getLedgerAccountsLines,
  getLedgerAccountsEntry,
  getProfitAndLoss,
  getProfitAndLossSummaries,
  getLinkedAccounts,
  getJournal,
  createJournalEntries,
  getPlaidLinkToken,
  getPlaidUpdateModeLinkToken,
  exchangePlaidPublicToken,
  unlinkAccount,
  unlinkPlaidItem,
  confirmConnection,
  denyConnection,
  getTasks,
  submitResponseToTask,
  breakPlaidItemConnection,
  syncConnection,
}
