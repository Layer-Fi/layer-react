import classNames from 'classnames'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HStack } from '@ui/Stack/Stack'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'
import { GlobalDateRangePicker } from '@components/GlobalDateRangePicker/GlobalDateRangePicker'

import './globalDateRangeSelection.scss'

export const GlobalDateRangeSelection = ({ showLabels = false }: { showLabels?: boolean }) => {
  const { value } = useSizeClass()

  return (
    <HStack className={classNames('Layer__GlobalDateRangeSelection', {
      'Layer__GlobalDateRangeSelection--mobile': value === 'mobile',
    })}
    >
      <DateSelectionComboBox showLabel={showLabels} />
      <GlobalDateRangePicker showLabels={showLabels} />
    </HStack>
  )
}
