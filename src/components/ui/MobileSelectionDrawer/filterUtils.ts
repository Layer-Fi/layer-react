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
