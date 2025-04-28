import { ListBox, ListBoxSection, Header, ListBoxItem } from 'react-aria-components'
import { Text, TextSize } from '../../Typography'
import { parseISO, format as formatTime } from 'date-fns'
import { centsToDollars as formatMoney } from '../../../models/Money'
import { DATE_FORMAT } from '../../../config/general'
import { VStack } from '../../ui/Stack/Stack'
import CheckIcon from '../../../icons/Check'
import { MenuSection } from './MenuSection'
import { CategoryOption } from '../types'

type MatchesListProps = {
  matches?: CategoryOption[]
  onSelect: (option: CategoryOption) => void
  value: CategoryOption | undefined
}

export const MatchesList = ({ matches, onSelect, value }: MatchesListProps) => {
  if (!matches || matches.length === 0) {
    return
  }

  return (
    <MenuSection>
      <ListBox slot='listbox' aria-label='Matches'>
        <ListBoxSection>
          <Header slot='header'>
            <Text size={TextSize.xs} status='disabled'>Match</Text>
          </Header>
          {matches?.map((option, index) => (
            <ListBoxItem className='Layer__category-select__ms-list-item' key={index} textValue={option.payload.display_name} onAction={() => onSelect(option)}>
              <VStack slot='label'>
                <Text slot='date-and-amount' size={TextSize.sm}>
                  {option.payload.date && formatTime(parseISO(option.payload.date), DATE_FORMAT)}
                  {' '}
                  |
                  {' '}
                  $
                  {formatMoney(option.payload.amount)}
                </Text>
                <Text slot='name'>{option.payload.display_name}</Text>
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
