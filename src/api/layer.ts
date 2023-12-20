import { authenticate } from './layer/authenticate'
import { getBalanceSheet } from './layer/balance_sheet'
import {
  getBankTransactions,
  categorizeBankTransaction,
} from './layer/bankTransactions'
import { getCategories } from './layer/categories'
import { getChartOfAccounts } from './layer/chart_of_accounts'
import { getProfitAndLoss } from './layer/profit_and_loss'

export const Layer = {
  authenticate,
  categorizeBankTransaction,
  getBalanceSheet,
  getBankTransactions,
  getCategories,
  getChartOfAccounts,
  getProfitAndLoss,
}
