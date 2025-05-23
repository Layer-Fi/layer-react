import { useRef } from 'react'
import { Header, ListBoxItem } from 'react-aria-components'
import { Text, TextSize } from '../../Typography'
import { CategoryOption } from '../types'
import { VStack } from '../../ui/Stack/Stack'
import { findParentCategory, isSelected } from '../utils'
import { Category } from '../../../types'
import CheckIcon from '../../../icons/Check'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip/Tooltip'
import InfoIcon from '../../../icons/InfoIcon'
import { ListSection } from './ListSection'

type SuggestionsListProps = {
  suggestions?: CategoryOption[]
  categories?: Category[]
  selected?: CategoryOption
}

type ListBoxItemContentProps = {
  option: CategoryOption
  categories: Category[]
  selected?: CategoryOption
}

const TOOLTIP_OFFSET = {
  mainAxis: 10,
  crossAxis: 20,
}

const ListBoxItemContent = ({ option, categories, selected }: ListBoxItemContentProps) => {
  const elRef = useRef<HTMLDivElement>(null)

  return (
    <ListBoxItem
      ref={elRef}
      id={`suggestion-${option.payload.id}`}
      className='Layer__category-select__ms-list-item'
      textValue={option.payload.display_name}
    >

      <VStack slot='label'>
        <Text slot='name'>
          {option.payload.display_name}
        </Text>
        <Text slot='account' size={TextSize.sm} status='disabled'>
          {findParentCategory(categories, option.payload.id)?.display_name}
        </Text>
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

      {isSelected(option, selected) && (
        <span slot='icon'>
          <CheckIcon size={16} />
        </span>
      )}
    </ListBoxItem>
  )
}

export const SuggestionsList = ({ suggestions, categories, selected }: SuggestionsListProps) => {
  if (!categories || !suggestions || suggestions.length === 0) {
    return
  }

  return (
    <ListSection aria-label='Suggestions'>
      <ListBoxItem isDisabled={true} textValue=' '>
        <Header slot='header'>
          <Text size={TextSize.xs}>Suggestions</Text>
        </Header>
      </ListBoxItem>
      {suggestions.map((option, index) => (
        <ListBoxItemContent
          key={index}
          option={option}
          categories={categories}
          selected={selected}
        />
      ))}
    </ListSection>
  )
}
