import { useContext } from 'react'
import { Button, ComboBoxStateContext } from 'react-aria-components'
import { Input } from '../../Input/Input'
import { CategoryOption } from '../types'
import ChevronDownIcon from '../../../icons/ChevronDown'
import { Badge, BadgeSize } from '../../Badge/Badge'
import MinimizeTwo from '../../../icons/MinimizeTwo'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

type ComboBoxInputProps = {
  name?: string
  placeholder?: string
  value?: CategoryOption
}

export const ComboBoxInput = ({ name, placeholder, value }: ComboBoxInputProps) => {
  const comboboxState = useContext(ComboBoxStateContext)

  const dataProps = toDataProperties({ match: value?.type === 'match' })

  return (
    <div slot='trigger' {...dataProps}>
      {value?.type === 'match' && (
        <Badge slot='match-badge' size={BadgeSize.SMALL} icon={<MinimizeTwo size={11} />}>
          Match
        </Badge>
      )}
      <Input
        slot='trigger-input'
        name={name}
        placeholder={placeholder}
        aria-label='Categorize'
        onFocus={() => comboboxState?.setInputValue('')}
        onBlur={() => {
          if (value?.payload.display_name) {
            comboboxState?.setInputValue(value?.payload.display_name)
          }
        }}
      />
      <Button slot='trigger-button'>
        <ChevronDownIcon />
      </Button>
    </div>
  )
}
