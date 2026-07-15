import {
  type AccountCategorizationSchema,
  type Classification,
  type ExclusionCategorizationSchema,
} from '@schemas/categorization'

import { bankTransactionCategories } from '@fixtures/bankTransactions/constants'
import { toAccountCategorization } from '@fixtures/bankTransactions/derive'

type AccountCategorization = typeof AccountCategorizationSchema.Type
type ExclusionCategorization = typeof ExclusionCategorizationSchema.Type

const toTitleCase = (stableName: string) =>
  stableName
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const KNOWN_CATEGORIES = Object.values(bankTransactionCategories)

/*
 * Resolves a request's classification against the fixture category catalog,
 * synthesizing a plausible categorization when the request references an
 * account the catalog doesn't know about.
 */
export const categorizationFromClassification = (
  classification: Classification,
): AccountCategorization | ExclusionCategorization => {
  if (classification.type === 'Exclusion') {
    return {
      type: 'Exclusion',
      id: `exclusion-${classification.exclusionType.toLowerCase()}`,
      category: classification.exclusionType,
      displayName: toTitleCase(classification.exclusionType),
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
      displayName: toTitleCase(classification.stableName),
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
