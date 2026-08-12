import classNames from 'classnames'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { useGlobalDatePreset, useGlobalDatePresetActions } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { DateSelectionComboBox } from '@blocks/DatePickers/DateSelection/DateSelectionComboBox'
import { GlobalDatePicker } from '@blocks/DatePickers/GlobalDatePicker/GlobalDatePicker'

import './globalDateSelection.scss'

const legacyClassNames = createLegacyClassNames({
  'Layer__GlobalDateSelection--compact': 'Layer__GlobalDateSelection--mobile',
})

type GlobalDateSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
}

export const GlobalDateSelection = ({ showLabels = false, isCompact = false }: GlobalDateSelectionProps) => {
  const datePreset = useGlobalDatePreset()
  const { setDatePreset } = useGlobalDatePresetActions()

  return (
    <div
      className={classNames('Layer__GlobalDateSelection Layer__variables', {
        [legacyClassNames('Layer__GlobalDateSelection--compact')]: isCompact,
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
