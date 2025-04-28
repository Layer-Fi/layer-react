import { ListBox, ListBoxSection, Header, ListBoxItem } from 'react-aria-components'
import { Text, TextSize } from '../../Typography'
import { parseISO, format as formatTime } from 'date-fns'
import { centsToDollars as formatMoney } from '../../../models/Money'
import { DATE_FORMAT } from '../../../config/general'
import { HStack, VStack } from '../../ui/Stack/Stack'
import CheckIcon from '../../../icons/Check'
import { MenuSection } from './MenuSection'
import { CategoryOption } from '../types'
import { HSeparator } from '../../Separator/Separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip/Tooltip'
import InfoIcon from '../../../icons/InfoIcon'

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
                <Text slot='name' ellipsis>{option.payload.display_name}</Text>
                <HStack slot='date-and-amount' gap='xs'>
                  <Text size={TextSize.sm} status='disabled'>{option.payload.date && formatTime(parseISO(option.payload.date), DATE_FORMAT)}</Text>
                  <HSeparator />
                  <Text size={TextSize.sm}>{`$${formatMoney(option.payload.amount)}`}</Text>
                </HStack>
              </VStack>

              {option.payload.description && (
                <Tooltip slot='tooltip'>
                  <TooltipTrigger>
                    <InfoIcon />
                  </TooltipTrigger>
                  <TooltipContent>
                    {option.payload.description}
                  </TooltipContent>
                </Tooltip>
              )}

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
