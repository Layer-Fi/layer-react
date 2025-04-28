import { ListBox, ListBoxSection, Header, ListBoxItem } from 'react-aria-components'
import { Text, TextSize } from '../../Typography'
import { MenuSection } from './MenuSection'
import { CategoryOption } from '../types'
import { VStack } from '../../ui/Stack/Stack'
import { findParentCategory } from '../utils'
import { Category } from '../../../types'
import CheckIcon from '../../../icons/Check'

type SuggestionsListProps = {
  suggestions?: CategoryOption[]
  categories?: Category[]
  onSelect: (option: CategoryOption) => void
  value: CategoryOption | undefined
}

export const SuggestionsList = ({ suggestions, categories, onSelect, value }: SuggestionsListProps) => {
  if (!categories || !suggestions || suggestions.length === 0) {
    return
  }

  return (
    <MenuSection>
      <ListBox slot='listbox' aria-label='Suggestions'>
        <ListBoxSection>
          <Header slot='header'>
            <Text size={TextSize.xs} status='disabled'>Suggestions</Text>
          </Header>
          {suggestions.map((option, index) => (
            <ListBoxItem className='Layer__category-select__ms-list-item' key={index} textValue={option.payload.display_name} onAction={() => onSelect(option)}>
              <VStack slot='label'>
                <Text slot='name'>{option.payload.display_name}</Text>
                <Text slot='account' size={TextSize.sm}>
                  {findParentCategory(categories, option.payload.id)?.display_name}
                </Text>
              </VStack>
              {value?.payload?.id === option.payload.id && (
                <span slot='icon'>
                  <CheckIcon size={12} />
                </span>
              )}
            </ListBoxItem>
          ),
          )}
        </ListBoxSection>
      </ListBox>
    </MenuSection>
  )
}
