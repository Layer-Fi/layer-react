import classNames from 'classnames'

import { useGlobalDateRange, useGlobalDateRangeActions } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'
import { GlobalDatePicker } from '@components/GlobalDatePicker/GlobalDatePicker'

import './globalDateSelection.scss'

type GlobalDateSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
}

export const GlobalDateSelection = ({ showLabels = false, isCompact = false }: GlobalDateSelectionProps) => {
  const dateRange = useGlobalDateRange({ dateSelectionMode: 'full' })
  const { setDateRange } = useGlobalDateRangeActions()

  return (
    <div
      className={classNames('Layer__GlobalDateSelection Layer__variables', {
        'Layer__GlobalDateSelection--compact': isCompact,
      })}
    >
      <DateSelectionComboBox
        dateRange={dateRange}
        setDateRange={setDateRange}
        showLabel={showLabels}
      />
      <GlobalDatePicker showLabel={showLabels} />
    </div>
  )
}
