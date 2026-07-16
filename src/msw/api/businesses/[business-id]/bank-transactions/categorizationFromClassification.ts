import {
  type AccountCategorizationSchema,
  type Classification,
  type ExclusionCategorizationSchema,
} from '@schemas/categorization'
import { humanizeEnum } from '@utils/format'

import { bankTransactionCategories } from '@fixtures/bankTransactions/constants'
import { toAccountCategorization } from '@fixtures/bankTransactions/derive'

type AccountCategorization = typeof AccountCategorizationSchema.Type
type ExclusionCategorization = typeof ExclusionCategorizationSchema.Type

const KNOWN_CATEGORIES = Object.values(bankTransactionCategories)

export const categorizationFromClassification = (
  classification: Classification,
): AccountCategorization | ExclusionCategorization => {
  if (classification.type === 'Exclusion') {
    return {
      type: 'Exclusion',
      id: `exclusion-${classification.exclusionType.toLowerCase()}`,
      category: classification.exclusionType,
      displayName: humanizeEnum(classification.exclusionType),
    }
  }

  if (classification.type === 'StableName') {
    const known = KNOWN_CATEGORIES.find(category => category.stableName === classification.stableName)
    if (known) return toAccountCategorization(known)

    return {
      type: 'Account',
      id: `category-${classification.stableName.toLowerCase().replaceAll('_', '-')}`,
      stableName: classification.stableName,
      category: classification.stableName,
      displayName: humanizeEnum(classification.stableName),
    }
  }

  const known = KNOWN_CATEGORIES.find(category => category.id === classification.id)
  if (known) return toAccountCategorization(known)

  return {
    type: 'Account',
    id: classification.id,
    stableName: null,
    category: classification.id,
    displayName: classification.id,
  }
}
