import classNames from 'classnames'

import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'
import { GlobalDateRangePicker } from '@components/GlobalDateRangePicker/GlobalDateRangePicker'

import './globalDateRangeSelection.scss'

type GlobalDateRangeSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
}

export const GlobalDateRangeSelection = ({ showLabels = false, isCompact = false }: GlobalDateRangeSelectionProps) => {
  return (
    <div
      className={classNames('Layer__GlobalDateRangeSelection', {
        'Layer__GlobalDateRangeSelection--compact': isCompact,
      })}
    >
      <DateSelectionComboBox showLabel={showLabels} />
      <GlobalDateRangePicker showLabels={showLabels} />
    </div>
  )
}
