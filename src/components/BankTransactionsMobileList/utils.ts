import { CategoryAsOption } from '@internal-types/categorizationOption'
import type { CategorizationEncoded, NestedCategorization } from '@schemas/categorization'

import { PersonalStableName } from './constants'

export interface CategoryGroup {
  label: string
  id: string
  categories: CategoryAsOption[]
}

function getLeafCategories(category: NestedCategorization): NestedCategorization[] {
  if (!category.subCategories || category.subCategories.length === 0) {
    return [category]
  }

  return category.subCategories.flatMap(subCategory => getLeafCategories(subCategory))
}

export const flattenCategories = (categories: NestedCategorization[]): Array<CategoryGroup | CategoryAsOption> => {
  return categories.flatMap((category: NestedCategorization): Array<CategoryGroup | CategoryAsOption> => {
    const subCategories = category.subCategories

    if (!subCategories || subCategories.length === 0) {
      return [new CategoryAsOption(category)]
    }

    const leafCategories = getLeafCategories(category)

    if (subCategories.every(subCategory => !subCategory.subCategories || subCategory.subCategories.length === 0)) {
      return [{
        label: category.displayName,
        id: 'id' in category ? category.id : category.stableName,
        categories: leafCategories.map(cat => new CategoryAsOption(cat)),
      } satisfies CategoryGroup]
    }

    return leafCategories.map(cat => new CategoryAsOption(cat))
  })
}

export const isPersonalCategory = (category: CategorizationEncoded): boolean => {
  // Check Exclusion for backwards compatibility
  if (category.type === 'Exclusion') {
    return true
  }

  if (category.type === 'Account' && 'stable_name' in category) {
    const stableName = category.stable_name
    return stableName === PersonalStableName.CREDIT || stableName === PersonalStableName.DEBIT
  }

  return false
}
