import i18next from 'i18next'

import { TripPurpose } from '@schemas/trip'
import { Toggle, ToggleSize } from '@ui/Toggle/Toggle'

export enum TripPurposeFilterValue {
  All = 'ALL',
  Business = TripPurpose.Business,
  Personal = TripPurpose.Personal,
}

const TRIP_PURPOSE_OPTIONS = [
  { label: i18next.t('all', 'All'), value: TripPurposeFilterValue.All },
  { label: i18next.t('business', 'Business'), value: TripPurposeFilterValue.Business },
  { label: i18next.t('personal', 'Personal'), value: TripPurposeFilterValue.Personal },
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
  return (
    <Toggle
      ariaLabel={i18next.t('tripPurpose', 'Trip purpose')}
      options={TRIP_PURPOSE_OPTIONS}
      selectedKey={selected}
      onSelectionChange={key => onChange(key as TripPurposeFilterValue)}
      size={ToggleSize.small}
      fullWidth={fullWidth}
    />
  )
}
