import classNames from 'classnames'

import { useGlobalPresetRange, useGlobalPresetRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'
import { GlobalDatePicker } from '@components/GlobalDatePicker/GlobalDatePicker'

import './globalDateSelection.scss'

type GlobalDateSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
  includeAllTime?: boolean
}

export const GlobalDateSelection = ({ showLabels = false, isCompact = false, includeAllTime = true }: GlobalDateSelectionProps) => {
  const { preset } = useGlobalPresetRange({ dateSelectionMode: 'full' })
  const { setPresetRange } = useGlobalPresetRangeActions()

  return (
    <div
      className={classNames('Layer__GlobalDateSelection', {
        'Layer__GlobalDateSelection--compact': isCompact,
      })}
    >
      <DateSelectionComboBox
        preset={preset}
        setPresetRange={setPresetRange}
        includeAllTime={includeAllTime}
        showLabel={showLabels}
      />
      <GlobalDatePicker showLabel={showLabels} />
    </div>
  )
}
