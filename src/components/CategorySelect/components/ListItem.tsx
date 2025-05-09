import { ListBoxItem } from 'react-aria-components'
import { Text } from '../../Typography'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip/Tooltip'
import InfoIcon from '../../../icons/InfoIcon'
import CheckIcon from '../../../icons/Check'
import { CategoryOption } from '../types'
import { isSelected } from '../utils'

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

export const ListItem = ({ option, indentationLevel = 0, showTooltips, selected, isDisabled }: ListItemProps) => {
  return (
    <ListBoxItem
      className='Layer__category-select__list-item'
      style={{
        paddingLeft: `${(Math.min(MAX_INDENT_LEVEL, indentationLevel) * INDENT_SIZE) + INDENT_BIAS}px`,
      }}
      textValue={option?.payload?.display_name}
      id={option?.payload?.id ?? option?.payload?.stable_name}
      isDisabled={isDisabled}
    >
      <div slot='name'>
        <Text>{option?.payload?.display_name}</Text>

        {(showTooltips && option?.payload?.description) && (
          <Tooltip>
            <TooltipTrigger slot='tooltip-trigger'>
              <InfoIcon />
            </TooltipTrigger>
            <TooltipContent>
              {option?.payload?.description}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {isSelected(option, selected) && (
        <CheckIcon slot='icon' size={16} />
      )}
    </ListBoxItem>
  )
}
