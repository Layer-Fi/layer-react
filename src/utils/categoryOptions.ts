import { CategoryAsOption } from '@internal-types/categorizationOption'
import { type NestedCategorization } from '@schemas/categorization/nestedCategorization'
import { getLeafCategories } from '@utils/categories'

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
