import { Button } from 'react-aria-components'

import ChevronDown from '@icons/ChevronDown'

import './pickerDropdownIndicator.scss'

type PickerDropdownIndicatorProps = {
  onClick?: () => void
}

export const PickerDropdownIndicator = ({ onClick }: PickerDropdownIndicatorProps) => (
  <Button className='Layer__PickerDropdownIndicator' onPress={onClick}>
    <ChevronDown size={16} />
  </Button>
)
