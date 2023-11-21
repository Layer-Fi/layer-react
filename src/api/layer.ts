import { authenticate } from './layer/authenticate'
import {
  getBankTransactions,
  categorizeBankTransaction,
} from './layer/bankTransactions'
import { getCategories } from './layer/categories'
import { getProfitAndLoss } from './layer/profit_and_loss'

export const Layer = {
  authenticate,
  getCategories,
  getBankTransactions,
  getProfitAndLoss,
  categorizeBankTransaction,
}
