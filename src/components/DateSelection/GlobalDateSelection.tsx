import classNames from 'classnames'

import { useGlobalDatePreset, useGlobalDatePresetActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'
import { GlobalDatePicker } from '@components/GlobalDatePicker/GlobalDatePicker'

import './globalDateSelection.scss'

type GlobalDateSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
}

export const GlobalDateSelection = ({ showLabels = false, isCompact = false }: GlobalDateSelectionProps) => {
  const datePreset = useGlobalDatePreset()
  const { setDatePreset } = useGlobalDatePresetActions()

  return (
    <div
      className={classNames('Layer__GlobalDateSelection', {
        'Layer__GlobalDateSelection--compact': isCompact,
      })}
    >
      <DateSelectionComboBox
        datePreset={datePreset}
        setDatePreset={setDatePreset}
        showLabel={showLabels}
      />
      <GlobalDatePicker showLabel={showLabels} />
    </div>
  )
}
