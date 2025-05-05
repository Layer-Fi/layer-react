import { ListBoxItem } from 'react-aria-components'
import { Text, TextSize } from '../../Typography'
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
  level?: number
  accountName: string
  showTooltips: boolean
  selected?: CategoryOption
}

export const ListItem = ({ option, level = 0, accountName, showTooltips, selected }: ListItemProps) => {
  return (
    <ListBoxItem
      className='Layer__category-select__list-item'
      style={{
        paddingLeft: `${(Math.min(MAX_INDENT_LEVEL, level) * INDENT_SIZE) + INDENT_BIAS}px`,
      }}
      textValue={option?.payload?.display_name}
      id={option?.payload?.id ?? option?.payload?.stable_name}
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

      <span slot='account'>
        <Text size={TextSize.sm} status='disabled' ellipsis>{accountName}</Text>
      </span>

      {isSelected(option, selected) && (
        <CheckIcon slot='icon' size={16} />
      )}
    </ListBoxItem>
  )
}
