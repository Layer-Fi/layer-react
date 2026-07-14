import { CategoryAsOption } from '@internal-types/categorizationOption'
import { type NestedCategorization } from '@schemas/categorization'
import { getLeafCategories } from '@utils/categories'

// Groups each top-level category's leaf accounts under an uppercased heading for
// use as combobox groups. Shared by the category and ledger-account comboboxes.
export const flattenCategories = (categories: NestedCategorization[]) =>
  categories.map(category => ({
    label: category.displayName.toLocaleUpperCase(),
    options: getLeafCategories([category]).map(leaf => new CategoryAsOption(leaf)),
  }))
