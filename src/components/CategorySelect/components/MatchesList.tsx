import { useRef } from 'react'
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
import classNames from 'classnames'

type MatchesListProps = {
  matches?: CategoryOption[]
  selected?: CategoryOption
}

type ListBoxItemContentProps = {
  option: CategoryOption
  selected?: CategoryOption
}

const TOOLTIP_OFFSET = {
  mainAxis: 10,
  crossAxis: 20,
}

const ListBoxItemContent = ({ option, selected }: ListBoxItemContentProps) => {
  const elRef = useRef<HTMLDivElement>(null)
  const isItemSelected = isSelected(option, selected)

  return (
    <ListBoxItem
      ref={elRef}
      className={classNames('Layer__category-select__ms-list-item', isItemSelected && 'Layer__category-select__list-item--selected')}
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
        <Tooltip
          slot='tooltip'
          placement='bottom-end'
          offset={TOOLTIP_OFFSET}
          refHoriztontalAlignment={{
            refElement: elRef,
            alignmentEdge: 'end',
          }}
        >
          <TooltipTrigger slot='tooltip-trigger'>
            <InfoIcon />
          </TooltipTrigger>
          <TooltipContent width='lg'>
            {option.payload.description}
          </TooltipContent>
        </Tooltip>
      )}

      {isItemSelected && (
        <span slot='icon'>
          <CheckIcon size={16} />
        </span>
      )}
    </ListBoxItem>
  )
}

export const MatchesList = ({ matches, selected }: MatchesListProps) => {
  if (!matches || matches.length === 0) {
    return
  }

  return (
    <ListSection>
      <ListBoxItem isDisabled={true} textValue=' '>
        <Header slot='header'>
          <Text size={TextSize.xs}>Match</Text>
        </Header>
      </ListBoxItem>
      {matches?.map((option, index) => (
        <ListBoxItemContent key={index} option={option} selected={selected} />
      ))}
    </ListSection>
  )
}
