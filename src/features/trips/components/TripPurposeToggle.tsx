import { Toggle, ToggleSize } from '@components/Toggle/Toggle'
import { TripPurpose } from '@schemas/trip'
import { useMemo } from 'react'

export enum TripPurposeFilterValue {
  All = 'ALL',
  Business = TripPurpose.Business,
  Personal = TripPurpose.Personal,
}

export type TripPurposeToggleProps = {
  selected: TripPurposeFilterValue
  onChange: (value: TripPurposeFilterValue) => void
  size?: ToggleSize
  name?: string
}

export const TripPurposeToggle = ({
  selected,
  onChange,
  size = ToggleSize.small,
  name = 'trip-purpose-filter',
}: TripPurposeToggleProps) => {
  const options = useMemo(() => [
    { label: 'All', value: TripPurposeFilterValue.All },
    { label: 'Business', value: TripPurposeFilterValue.Business },
    { label: 'Personal', value: TripPurposeFilterValue.Personal },
  ], [])

  return (
    <Toggle
      name={name}
      options={options}
      selected={selected}
      onChange={e => onChange(e.target.value as TripPurposeFilterValue)}
      size={size}
    />
  )
}
