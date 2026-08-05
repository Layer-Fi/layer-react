import { type CategoryAsOption } from '@internal-types/categorizationOption'
import type { NestedCategorization } from '@schemas/categorization/nestedCategorization'
import { groupCategoriesByParent } from '@utils/features/categorization/categoryOptions'
import type { ActionableListOption } from '@blocks/ActionableList/ActionableList'

export interface CategoryGroup {
  label: string
  id: string
  categories: CategoryAsOption[]
}

export type CategoryOption = CategoryGroup | CategoryAsOption

export const isGroup = (item: CategoryOption): item is CategoryGroup => {
  return 'categories' in item
}

export const flattenCategories = (categories: NestedCategorization[]): Array<CategoryGroup | CategoryAsOption> =>
  groupCategoriesByParent(categories).map(({ category, label, options }) => {
    if (options.length === 1) {
      return options[0]
    }

    return {
      label,
      id: 'id' in category ? category.id : category.stableName,
      categories: options,
    } satisfies CategoryGroup
  })

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
