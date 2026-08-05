import { CategoryAsOption } from '@internal-types/features/categorization/categorizationOption'
import { type NestedCategorization } from '@schemas/features/categorization/nestedCategorization'
import { getLeafCategories } from '@utils/features/categorization/categories'

export type CategoryOptionGroup = {
  category: NestedCategorization
  label: string
  options: CategoryAsOption[]
}

export const groupCategoriesByParent = (categories: NestedCategorization[]): CategoryOptionGroup[] =>
  categories.map(category => ({
    category,
    label: category.displayName,
    options: getLeafCategories([category]).map(leaf => new CategoryAsOption(leaf)),
  }))

export const flattenCategories = (categories: NestedCategorization[]) =>
  groupCategoriesByParent(categories).map(({ label, options }) => ({
    label: label.toLocaleUpperCase(),
    options,
  }))

export const withoutExclusions = (categories: NestedCategorization[]) =>
  categories.filter(category => category.type !== 'ExclusionNested')
