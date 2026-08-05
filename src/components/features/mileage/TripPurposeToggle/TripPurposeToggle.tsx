import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { TripPurposeFilterValue } from '@schemas/features/mileage/trip'
import { translationKey } from '@utils/shared/i18n/translationKey'
import { Toggle, ToggleSize } from '@ui/Toggle/Toggle'

const TRIP_PURPOSE_CONFIG = [
  { ...translationKey('common:label.all', 'All'), value: TripPurposeFilterValue.All },
  { ...translationKey('common:label.business', 'Business'), value: TripPurposeFilterValue.Business },
  { ...translationKey('common:label.personal', 'Personal'), value: TripPurposeFilterValue.Personal },
]

export type TripPurposeToggleProps = {
  selected: TripPurposeFilterValue
  onChange: (value: TripPurposeFilterValue) => void
  fullWidth?: boolean
}

export const TripPurposeToggle = ({
  selected,
  onChange,
  fullWidth,
}: TripPurposeToggleProps) => {
  const { t } = useTranslation()
  const options = useMemo(
    () => TRIP_PURPOSE_CONFIG.map(opt => ({
      value: opt.value,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )
  return (
    <Toggle
      ariaLabel={t('trips:label.trip_purpose', 'Trip purpose')}
      options={options}
      selectedKey={selected}
      onSelectionChange={key => onChange(key as TripPurposeFilterValue)}
      size={ToggleSize.small}
      fullWidth={fullWidth}
    />
  )
}
