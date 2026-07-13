import {
  type BankTransactionCategorization,
  BankTransactionSelectionVariant,
} from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export enum Purpose {
  business = 'business',
  personal = 'personal',
  more = 'more',
}

export const getPurposeFromStore = (selectedCategorization: BankTransactionCategorization): Purpose => {
  if (selectedCategorization.variant === BankTransactionSelectionVariant.MATCH) {
    return Purpose.more
  }

  const category = selectedCategorization.category
  if (category === null) {
    return Purpose.business
  }

  if (isSplitAsOption(category)) {
    return category.isSingleSplit ? Purpose.business : Purpose.more
  }

  return Purpose.business
}
