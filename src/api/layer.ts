import { authenticate } from './layer/authenticate'
import {
  getBankTransactions,
  categorizeBankTransaction,
} from './layer/bankTransactions'
import { getCategories } from './layer/categories'

export const Layer = {
  authenticate,
  getCategories,
  getBankTransactions,
  categorizeBankTransaction,
}
