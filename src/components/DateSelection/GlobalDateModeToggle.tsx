import type { Key } from 'react-aria-components'

import {
  type DateSelectionMode,
  useGlobalDateMode,
  useGlobalDateModeActions,
} from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { Toggle } from '@ui/Toggle/Toggle'

type DateModeToggleValue = Extract<DateSelectionMode, 'full' | 'month'>

const options = [
  { value: 'month', label: 'Monthly' },
  { value: 'full', label: 'Range' },
] as const satisfies { value: DateModeToggleValue, label: string }[]

type GlobalDateModeToggleProps = {
  ariaLabel?: string
}

export const GlobalDateModeToggle = ({ ariaLabel = 'Date mode' }: GlobalDateModeToggleProps) => {
  const dateMode = useGlobalDateMode()
  const { setDateMode } = useGlobalDateModeActions()

  const selectedKey: DateModeToggleValue = dateMode === 'full' ? 'full' : 'month'

  const onSelectionChange = (key: Key) => {
    if (key !== 'month' && key !== 'full') return
    setDateMode({ dateMode: key })
  }

  return (
    <Toggle
      ariaLabel={ariaLabel}
      options={options}
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}
    />
  )
}
