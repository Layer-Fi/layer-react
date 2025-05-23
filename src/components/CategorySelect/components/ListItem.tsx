import { useRef } from 'react'
import { ListBoxItem } from 'react-aria-components'
import { Text } from '../../Typography'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip/Tooltip'
import InfoIcon from '../../../icons/InfoIcon'
import CheckIcon from '../../../icons/Check'
import { CategoryOption } from '../types'
import { buildKey, isSelected } from '../utils'
import classNames from 'classnames'

const MAX_INDENT_LEVEL = 3
const INDENT_SIZE = 12
const INDENT_BIAS = 24

export type ListItemProps = {
  option: CategoryOption
  indentationLevel?: number
  showTooltips: boolean
  selected?: CategoryOption
  isDisabled?: boolean
}

const TOOLTIP_OFFSET = {
  mainAxis: 10,
  crossAxis: 20,
}

export const ListItem = ({ option, indentationLevel = 0, showTooltips, selected, isDisabled }: ListItemProps) => {
  const elRef = useRef<HTMLDivElement>(null)
  const isItemSelected = isSelected(option, selected)

  return (
    <ListBoxItem
      ref={elRef}
      className={classNames('Layer__category-select__list-item', isItemSelected && 'Layer__category-select__list-item--selected')}
      style={{
        paddingLeft: `${(Math.min(MAX_INDENT_LEVEL, indentationLevel) * INDENT_SIZE) + INDENT_BIAS}px`,
      }}
      textValue={option?.payload?.display_name}
      id={buildKey(option)}
      isDisabled={isDisabled}
    >
      <div slot='name'>
        <Text>{option?.payload?.display_name}</Text>

        {(showTooltips && option?.payload?.description) && (
          <Tooltip
            refHoriztontalAlignment={{
              refElement: elRef,
              alignmentEdge: 'start',
            }}
            offset={TOOLTIP_OFFSET}
            placement='bottom-end'
          >
            <TooltipTrigger slot='tooltip-trigger'>
              <InfoIcon />
            </TooltipTrigger>
            <TooltipContent width='lg'>
              {option?.payload?.description}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {isItemSelected && (
        <CheckIcon slot='icon' size={16} />
      )}
    </ListBoxItem>
  )
}
