import { Header, ListBoxItem } from 'react-aria-components'
import { Text, TextSize } from '../../Typography'
import { parseISO, format as formatTime } from 'date-fns'
import { centsToDollars as formatMoney } from '../../../models/Money'
import { DATE_FORMAT } from '../../../config/general'
import { HStack, VStack } from '../../ui/Stack/Stack'
import CheckIcon from '../../../icons/Check'
import { ListSection } from './ListSection'
import { CategoryOption } from '../types'
import { HSeparator } from '../../Separator/Separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip/Tooltip'
import InfoIcon from '../../../icons/InfoIcon'
import { isSelected } from '../utils'

type MatchesListProps = {
  matches?: CategoryOption[]
  selected?: CategoryOption
}

export const MatchesList = ({ matches, selected }: MatchesListProps) => {
  if (!matches || matches.length === 0) {
    return
  }

  return (
    <ListSection>
      <Header slot='header'>
        <Text size={TextSize.xs} status='disabled'>Match</Text>
      </Header>
      {matches?.map((option, index) => (
        <ListBoxItem
          className='Layer__category-select__ms-list-item'
          key={index}
          id={`match-${option.payload.id}`}
          textValue={option.payload.display_name}
        >

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

          {isSelected(option, selected) && (
            <span slot='icon'>
              <CheckIcon size={16} />
            </span>
          )}
        </ListBoxItem>
      ),
      )}
    </ListSection>
  )
}
