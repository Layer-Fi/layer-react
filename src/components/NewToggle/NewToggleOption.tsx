import { SelectionIndicator, ToggleButton } from 'react-aria-components'

import { Span } from '@ui/Typography/Text'

import './newToggleOption.scss'
export interface NewToggleOptionProps {
  label: string
  value: string
}

export const NewToggleOption = ({
  label,
  value,
}: NewToggleOptionProps) => {
  return (
    <ToggleButton id={value} className='Layer__NewToggleOption'>
      <SelectionIndicator className='Layer__NewToggleOption-SelectionIndicator' />
      <Span className='Layer__NewToggle-Option-Content'>
        <Span noWrap>{label}</Span>
      </Span>
    </ToggleButton>
  )
}
