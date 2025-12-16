import classNames from 'classnames'

import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { HStack } from '@ui/Stack/Stack'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'
import { GlobalDateRangePicker } from '@components/GlobalDateRangePicker/GlobalDateRangePicker'

import './dateRangeSelection.scss'

export const DateRangeSelection = () => {
  const { value } = useSizeClass()

  return (
    <HStack className={classNames('Layer__DateRangeSelection', {
      'Layer__DateRangeSelection--mobile': value === 'mobile',
    })}
    >
      <DateSelectionComboBox />
      <GlobalDateRangePicker />
    </HStack>
  )
}
