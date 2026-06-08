import { type AccountIdentifier, AccountIdEquivalence, AccountStableNameEquivalence, makeAccountId, makeStableName } from '@schemas/accountIdentifier'
import { type NestedCategorization } from '@schemas/categorization'

export const accountIdentifierIsForCategory = (accountIdentifier: AccountIdentifier, category: NestedCategorization): boolean => {
  if (accountIdentifier.type === 'AccountId') {
    switch (category.type) {
      case 'AccountNested':
        return AccountIdEquivalence(accountIdentifier, makeAccountId(category.id))
      case 'OptionalAccountNested':
        return false
      case 'ExclusionNested':
        return false
    }
  }

  switch (category.type) {
    case 'AccountNested':
      return category.stableName ? AccountStableNameEquivalence(accountIdentifier, makeStableName(category.stableName)) : false
    case 'OptionalAccountNested':
      return AccountStableNameEquivalence(accountIdentifier, makeStableName(category.stableName))
    case 'ExclusionNested':
      return false
  }
}

export const getResolvedCategoryName = (
  accountIdentifier: AccountIdentifier,
  options: NestedCategorization[],
): string | undefined =>
  options.find(option => accountIdentifierIsForCategory(accountIdentifier, option))?.displayName

export const getLeafCategories = (categories: NestedCategorization[]): NestedCategorization[] => {
  return categories.flatMap((category) => {
    if (!category.subCategories || category.subCategories.length === 0) {
      return [category]
    }
    return getLeafCategories(category.subCategories)
  })
}

export const flattenCategories = (categories: NestedCategorization[]): NestedCategorization[] => {
  return categories.flatMap(category => [
    category,
    ...(category.subCategories ? flattenCategories(category.subCategories) : []),
  ])
}
