import { authenticate } from './layer/authenticate'
import { getBalanceSheet } from './layer/balance_sheet'
import {
  getBankTransactions,
  categorizeBankTransaction,
  matchBankTransaction,
} from './layer/bankTransactions'
import { getCategories } from './layer/categories'
import { getLedgerAccounts, createAccount } from './layer/ledger_accounts'
import { getLinkedAccounts } from './layer/linked_accounts'
import { getProfitAndLoss } from './layer/profit_and_loss'

export const Layer = {
  authenticate,
  categorizeBankTransaction,
  matchBankTransaction,
  createAccount,
  getBalanceSheet,
  getBankTransactions,
  getCategories,
  getLedgerAccounts,
  getProfitAndLoss,
  getLinkedAccounts,
}
