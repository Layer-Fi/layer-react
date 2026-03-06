import { TripPurpose } from '@schemas/trip'
import { Toggle, ToggleSize } from '@ui/Toggle/Toggle'

export enum TripPurposeFilterValue {
  All = 'ALL',
  Business = TripPurpose.Business,
  Personal = TripPurpose.Personal,
}

const TRIP_PURPOSE_OPTIONS = [
  { label: 'All', value: TripPurposeFilterValue.All },
  { label: 'Business', value: TripPurposeFilterValue.Business },
  { label: 'Personal', value: TripPurposeFilterValue.Personal },
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
      ariaLabel='Trip purpose'
      options={TRIP_PURPOSE_OPTIONS}
      selectedKey={selected}
      onSelectionChange={key => onChange(key as TripPurposeFilterValue)}
      size={ToggleSize.small}
      fullWidth={fullWidth}
    />
  )
}
