import { useMemo } from 'react'
import classNames from 'classnames'
import { useCategories } from '../../hooks/categories/useCategories'
import { Popover, ComboBox, ListBox, Header, Key, ListBoxItem } from 'react-aria-components'
import { CategorySelectProps } from './types'
import { buildAllCategories, buildMatchOptions, buildSuggestedOptions, getKeysMap } from './utils'
import { CategorySelectDrawer } from './CategorySelectDrawer'
import { Text, TextSize } from '../Typography/Text'
import pluralize from 'pluralize'
import { SuggestionsList } from './components/SuggestionsList'
import { MatchesList } from './components/MatchesList'
import { ListSection } from './components/ListSection'
import { CategoriesList } from './components/CategoriesList'
import { ComboBoxInput } from './components/ComboBoxInput'

export const CategorySelect = ({
  bankTransaction,
  name,
  value,
  onChange,
  disabled,
  className,
  showTooltips,
  excludeMatches = false,
  asDrawer = false,
}: CategorySelectProps) => {
  const { data: categories } = useCategories()

  const matches = buildMatchOptions(bankTransaction, excludeMatches)
  const suggestions = buildSuggestedOptions(bankTransaction)
  const allCategories = buildAllCategories(categories ?? [])

  const allKeys = useMemo(() => {
    const categoriesKeysMap = getKeysMap(allCategories.flatMap(group => group.options))
    const matchKeysMap = getKeysMap(matches ?? [])

    return new Map([...categoriesKeysMap, ...matchKeysMap])
  }, [allCategories, matches])

  const placeholder = matches && matches.length > 1
    ? pluralize('possible match', matches.length, true)
    : 'Categorize or match...'

  const onSelectionChange = (key: Key | null) => {
    if (!key) {
      return
    }

    const selectedOption = allKeys.get((key as string).replace('suggestion-', '').replace('match-', ''))
    if (selectedOption) {
      onChange(selectedOption)
    }
  }

  if (asDrawer) {
    return (
      <CategorySelectDrawer
        onSelect={onChange}
        selected={value}
        showTooltips={showTooltips}
      />
    )
  }

  return (
    <div className={classNames('Layer__category-select', className)}>
      <ComboBox
        defaultInputValue={value?.payload.display_name}
        isDisabled={disabled}
        onSelectionChange={onSelectionChange}
        aria-label='Categorize'
      >
        <ComboBoxInput name={name} placeholder={placeholder} value={value} />
        <Popover className='Layer__category-select__popover' placement='bottom end'>
          <ListBox>
            <MatchesList matches={matches} selected={value} />

            <SuggestionsList suggestions={suggestions} categories={categories} selected={value} />

            <ListSection>
              <ListBoxItem isDisabled={true}>
                <Header slot='header'>
                  <Text size={TextSize.xs}>All categories</Text>
                </Header>
              </ListBoxItem>
              {allCategories.map(categoriesGroup => (
                categoriesGroup.options.map(categoryOption => (
                  <CategoriesList
                    key={`${categoryOption.payload?.id ?? categoryOption.payload?.stable_name}`}
                    option={categoryOption}
                    selected={value}
                    level={0}
                    showTooltips={showTooltips}
                  />
                ))
              ))}
            </ListSection>
          </ListBox>
        </Popover>
      </ComboBox>
    </div>
  )
}
