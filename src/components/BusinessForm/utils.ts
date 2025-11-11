import { BusinessFormOptionValue } from './BusinessFormMobileItem'

export const isSelectCategoryOption = (
  value: BusinessFormOptionValue,
): value is { type: 'SELECT_CATEGORY' } => {
  return 'type' in value && value.type === 'SELECT_CATEGORY'
}

export const getOptionId = (value: BusinessFormOptionValue): string => {
  return isSelectCategoryOption(value) ? 'SELECT_CATEGORY' : value.value
}

export const getOptionLabel = (value: BusinessFormOptionValue): string => {
  return isSelectCategoryOption(value) ? 'See all categories' : value.label
}
