import classNames from 'classnames'

import { useGlobalDatePreset, useGlobalDateRange, useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'
import { GlobalDatePicker } from '@components/GlobalDatePicker/GlobalDatePicker'

import './globalDateSelection.scss'

type GlobalDateSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
  includeAllTime?: boolean
}

export const GlobalDateSelection = ({ showLabels = false, isCompact = false, includeAllTime = true }: GlobalDateSelectionProps) => {
  const dateRange = useGlobalDateRange({ dateSelectionMode: 'full' })
  const preset = useGlobalDatePreset()
  const { setDateRange, setPresetRange } = useGlobalDateRangeActions()

  return (
    <div
      className={classNames('Layer__GlobalDateSelection', {
        'Layer__GlobalDateSelection--compact': isCompact,
      })}
    >
      <DateSelectionComboBox
        dateRange={dateRange}
        setDateRange={setDateRange}
        preset={preset}
        setPresetRange={setPresetRange}
        includeAllTime={includeAllTime}
        showLabel={showLabels}
      />
      <GlobalDatePicker showLabel={showLabels} />
    </div>
  )
}
