import { authenticate } from './layer/authenticate'
import { getBalanceSheet } from './layer/balance_sheet'
import {
  getBankTransactions,
  categorizeBankTransaction,
  matchBankTransaction,
} from './layer/bankTransactions'
import { getCategories } from './layer/categories'
import {
  getChartOfAccounts,
  getLedgerAccountBalances,
  createAccount,
  updateAccount,
  getLedgerAccountsLines,
  getLedgerAccountsEntry,
} from './layer/chart_of_accounts'
import {
  getLinkedAccounts,
  getPlaidLinkToken,
  getPlaidUpdateModeLinkToken,
  exchangePlaidPublicToken,
  unlinkPlaidItem,
  unlinkAccount,
  confirmConnection,
  denyConnection,
} from './layer/linked_accounts'
import { getProfitAndLoss } from './layer/profit_and_loss'

export const Layer = {
  authenticate,
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
  getLinkedAccounts,
  getJournal,
  addEntry,
  getPlaidLinkToken,
  getPlaidUpdateModeLinkToken,
  exchangePlaidPublicToken,
  unlinkAccount,
  unlinkPlaidItem,
  confirmConnection,
  denyConnection,
}
