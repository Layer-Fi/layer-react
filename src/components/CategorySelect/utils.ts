import { CategoryAsOption } from '@internal-types/categorizationOption'
import type { NestedCategorization } from '@schemas/categorization'
import type { ActionableListOption } from '@components/ActionableList/ActionableList'

export interface CategoryGroup {
  label: string
  id: string
  categories: CategoryAsOption[]
}

export type CategoryOption = CategoryGroup | CategoryAsOption

export const isGroup = (item: CategoryOption): item is CategoryGroup => {
  return 'categories' in item
}

export const flattenCategories = (categories: NestedCategorization[]): Array<CategoryGroup | CategoryAsOption> => {
  return categories.flatMap((category: NestedCategorization): Array<CategoryGroup | CategoryAsOption> => {
    const subCategories = category.subCategories

    if (!subCategories || subCategories.length === 0) {
      return [new CategoryAsOption(category)]
    }

    if (subCategories.every(subCategory => !subCategory.subCategories || subCategory.subCategories.length === 0)) {
      return [{
        label: category.displayName,
        id: 'id' in category ? category.id : category.stableName,
        categories: subCategories.map(cat => new CategoryAsOption(cat)),
      } satisfies CategoryGroup]
    }

    return flattenCategories(subCategories)
  })
}

export const buildFilteredCategoryOptions = (
  categoryOptions: CategoryOption[],
  query: string,
): ActionableListOption<CategoryOption>[] => {
  let options = categoryOptions

  if (query) {
    const lower = query.toLowerCase()

    options = options.flatMap((opt) => {
      if ('categories' in opt) {
        return opt.categories.filter(cat =>
          cat.label.toLowerCase().includes(lower),
        )
      }

      return opt.label.toLowerCase().includes(lower) ? [opt] : []
    })
  }

  return [...options]
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(opt => 'categories' in opt
      ? { label: opt.label, id: opt.id, value: opt, asLink: true }
      : { label: opt.label, id: opt.value, description: opt.original.description ?? undefined, value: opt })
}
