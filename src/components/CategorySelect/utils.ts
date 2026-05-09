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
      if (subCategories.length === 1) {
        return [new CategoryAsOption(subCategories[0])]
      }

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
  selectedId?: string,
): ActionableListOption<CategoryOption>[] => {
  let options = categoryOptions
  const selectedCategoryInGroup = !query && selectedId
    ? findSelectedCategoryInGroup(categoryOptions, selectedId)
    : null

  if (query) {
    const lower = query.toLowerCase()

    options = options.flatMap((opt) => {
      if (isGroup(opt)) {
        return opt.categories.filter(cat =>
          cat.label.toLowerCase().includes(lower),
        )
      }

      return opt.label.toLowerCase().includes(lower) ? [opt] : []
    })
  }

  return [
    ...(selectedCategoryInGroup ? [toActionableListOption(selectedCategoryInGroup)] : []),
    ...[...options]
      .sort((a, b) => {
        if (selectedId) {
          const aSelected = isSelectedCategory(a, selectedId)
          const bSelected = isSelectedCategory(b, selectedId)
          if (aSelected !== bSelected) return aSelected ? -1 : 1
        }
        return a.label.localeCompare(b.label)
      })
      .map(toActionableListOption),
  ]
}

const findSelectedCategoryInGroup = (options: CategoryOption[], selectedId: string): CategoryAsOption | null => {
  for (const option of options) {
    if (!isGroup(option)) {
      continue
    }

    const selectedCategory = option.categories.find(category => category.value === selectedId)
    if (selectedCategory) {
      return selectedCategory
    }
  }

  return null
}

const isSelectedCategory = (opt: CategoryOption, selectedId: string): boolean => {
  if (isGroup(opt)) {
    return false
  }

  return opt.value === selectedId
}

const toActionableListOption = (opt: CategoryOption): ActionableListOption<CategoryOption> => {
  const baseOption = {
    label: opt.label,
    value: opt,
  }

  return isGroup(opt)
    ? { ...baseOption, id: getGroupActionableId(opt.id, opt.label), asLink: true }
    : { ...baseOption, id: getCategoryActionableId(opt.value, opt.label), description: opt.original.description ?? undefined }
}

export const getSelectedCategoryActionableId = (selectedValue: { value: string, label: string } | null): string | undefined => {
  if (!selectedValue) return undefined

  return getCategoryActionableId(selectedValue.value, selectedValue.label)
}

const getGroupActionableId = (id: string, label: string): string => {
  return `group:${id}|label:${label}`
}

const getCategoryActionableId = (value: string, label: string): string => {
  return `category:${value}|label:${label}`
}
