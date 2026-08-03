import type { ComboBoxOption, OptionsOrGroups } from '@ui/ComboBox/types'

const matches = (text: string, query: string) =>
  text.toLowerCase().includes(query)

const filterOptions = <T extends ComboBoxOption>(
  options: ReadonlyArray<T>,
  query: string,
): ReadonlyArray<T> => options.filter(option => matches(option.label, query))

export const filterOptionsOrGroups = <T extends ComboBoxOption>(
  source: OptionsOrGroups<T>,
  query: string,
): OptionsOrGroups<T> => {
  if (source.options) {
    return { options: query ? filterOptions(source.options, query) : source.options }
  }
  if (source.groups) {
    if (!query) return { groups: source.groups }
    const filteredGroups = source.groups
      .map(group => (
        matches(group.label, query)
          ? group
          : { ...group, options: filterOptions(group.options, query) }
      ))
      .filter(group => group.options.length > 0)
    return { groups: filteredGroups }
  }
  return { options: [] }
}

export const resolveSelectedOption = <T extends ComboBoxOption>(
  source: OptionsOrGroups<T>,
  selectedValue: T | null,
): T | null => {
  if (!selectedValue) return null

  const options = source.options ?? []
  const optionMatch = options.find(option => option.value === selectedValue.value)
  if (optionMatch) return optionMatch

  const groups = source.groups ?? []
  for (const group of groups) {
    const match = group.options.find(option => option.value === selectedValue.value)
    if (match) return match
  }

  return selectedValue
}
