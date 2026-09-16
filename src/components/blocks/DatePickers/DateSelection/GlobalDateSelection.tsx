import classNames from 'classnames'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { useGlobalDatePreset, useGlobalDatePresetActions } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { DateSelectionComboBox } from '@blocks/DatePickers/DateSelection/DateSelectionComboBox'
import { GlobalDatePicker } from '@blocks/DatePickers/GlobalDatePicker/GlobalDatePicker'

import './globalDateSelection.scss'

const legacyClassNames = createLegacyClassNames({
  /* Briefly a size-derived modifier, unrelated to the compact prop that replaced it in layout. */
  'selection:mobile': 'Layer__GlobalDateSelection--mobile',
})

type GlobalDateSelectionProps = {
  showLabels?: boolean
  isCompact?: boolean
}

export const GlobalDateSelection = ({ showLabels = false, isCompact = false }: GlobalDateSelectionProps) => {
  const datePreset = useGlobalDatePreset()
  const { setDatePreset } = useGlobalDatePresetActions()
  const { isMobile } = useSizeClass()

  return (
    <div
      className={classNames('Layer__GlobalDateSelection Layer__variables', {
        'Layer__GlobalDateSelection--compact': isCompact,
        [legacyClassNames('selection:mobile')]: isMobile,
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
