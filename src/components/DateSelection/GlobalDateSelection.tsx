import classNames from 'classnames'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HStack } from '@ui/Stack/Stack'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'
import { GlobalDatePicker } from '@components/GlobalDatePicker/GlobalDatePicker'

import './globalDateSelection.scss'

export const GlobalDateSelection = ({ showLabels = false }: { showLabels?: boolean }) => {
  const { value } = useSizeClass()

  return (
    <HStack
      className={classNames('Layer__GlobalDateSelection', {
        'Layer__GlobalDateSelection--mobile': value === 'mobile',
      })}
    >
      <DateSelectionComboBox showLabel={showLabels} />
      <GlobalDatePicker showLabel={showLabels} />
    </HStack>
  )
}
