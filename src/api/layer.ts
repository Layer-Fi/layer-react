import { authenticate } from './layer/authenticate'
import {
  getBankTransactions,
  categorizeBankTransaction,
} from './layer/bankTransactions'
import { getCategories } from './layer/categories'

export default {
  authenticate,
  getCategories,
  getBankTransactions,
  categorizeBankTransaction,
}
