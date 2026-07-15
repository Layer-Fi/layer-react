import { CategoryAsOption } from '@internal-types/categorizationOption'
import { type NestedCategorization } from '@schemas/categorization'
import { getLeafCategories } from '@utils/categories'

export const flattenCategories = (categories: NestedCategorization[]) =>
  categories.map(category => ({
    label: category.displayName.toLocaleUpperCase(),
    options: getLeafCategories([category]).map(leaf => new CategoryAsOption(leaf)),
  }))
