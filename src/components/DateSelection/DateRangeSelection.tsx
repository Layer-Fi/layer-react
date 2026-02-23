import classNames from 'classnames'

import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { HStack } from '@ui/Stack/Stack'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'
import { GlobalDateRangePicker } from '@components/GlobalDateRangePicker/GlobalDateRangePicker'

import './dateRangeSelection.scss'

export const DateRangeSelection = ({ showLabels = false }: { showLabels?: boolean }) => {
  const { value } = useSizeClass()

  return (
    <HStack className={classNames('Layer__DateRangeSelection', {
      'Layer__DateRangeSelection--mobile': value === 'mobile',
    })}
    >
      <DateSelectionComboBox showLabel={showLabels} />
      <GlobalDateRangePicker showLabels={showLabels} />
    </HStack>
  )
}
