import classNames from 'classnames'

import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { HStack } from '@ui/Stack/Stack'
import { DateSelectionComboBox } from '@components/DateSelection/DateSelectionComboBox'
import { GlobalDatePicker } from '@components/GlobalDatePicker/GlobalDatePicker'

import './dateSelection.scss'

export const DateSelection = ({ showLabels = false }: { showLabels?: boolean }) => {
  const { value } = useSizeClass()

  return (
    <HStack
      className={classNames('Layer__DateSelection', {
        'Layer__DateSelection--mobile': value === 'mobile',
      })}
    >
      <DateSelectionComboBox showLabel={showLabels} />
      <GlobalDatePicker showLabel={showLabels} />
    </HStack>
  )
}
