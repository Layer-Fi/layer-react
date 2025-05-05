import { Button } from 'react-aria-components'
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
  const dataProps = toDataProperties({ match: value?.type === 'match' })

  return (
    <div slot='trigger' {...dataProps}>
      {value?.type === 'match' && (
        <Badge slot='match-badge' size={BadgeSize.SMALL} icon={<MinimizeTwo size={11} />}>
          Match
        </Badge>
      )}
      <Input slot='trigger-input' name={name} placeholder={placeholder} aria-label='Categorize' />
      <Button slot='trigger-button'>
        <ChevronDownIcon />
      </Button>
    </div>
  )
}
