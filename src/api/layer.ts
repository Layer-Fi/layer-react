import { authenticate } from './layer/authenticate'
import { getBankTransactions } from './layer/bankTransactions'
import { getCategories } from './layer/categories'

export default {
  authenticate,
  getCategories,
  getBankTransactions,
}
