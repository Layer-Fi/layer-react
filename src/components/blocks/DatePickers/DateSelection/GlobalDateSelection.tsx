import classNames from 'classnames'

import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { useGlobalDatePreset, useGlobalDatePresetActions } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { DateSelectionComboBox } from '@blocks/DatePickers/DateSelection/DateSelectionComboBox'
import { GlobalDatePicker } from '@blocks/DatePickers/GlobalDatePicker/GlobalDatePicker'

import './globalDateSelection.scss'

const legacyClassNames = createLegacyClassNames({
  'state:compact': 'Layer__GlobalDateSelection--compact',
  /* Briefly a size-derived modifier, unrelated to the compact prop that replaced it in layout. */
  'state:mobile': 'Layer__GlobalDateSelection--mobile',
} satisfies LegacyClassNameMapFor<'Layer__GlobalDateSelection', `state:${string}`>)

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
      className={classNames(
        'Layer__GlobalDateSelection',
        'Layer__variables',
        legacyClassNames(isCompact && 'state:compact', isMobile && 'state:mobile'),
      )}
      {...toDataProperties({ compact: isCompact })}
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
