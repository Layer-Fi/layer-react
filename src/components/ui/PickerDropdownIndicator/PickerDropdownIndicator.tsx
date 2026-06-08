import { ChevronDown } from 'lucide-react'
import { Button } from 'react-aria-components/Button'

import './pickerDropdownIndicator.scss'

type PickerDropdownIndicatorProps = {
  onClick?: () => void
}

export const PickerDropdownIndicator = ({ onClick }: PickerDropdownIndicatorProps) => (
  <Button className='Layer__PickerDropdownIndicator' onPress={onClick}>
    <ChevronDown size={16} />
  </Button>
)
