import { useMemo } from 'react'

import { TripPurpose } from '@schemas/trip'
import { Toggle, ToggleSize } from '@ui/Toggle/Toggle'

export enum TripPurposeFilterValue {
  All = 'ALL',
  Business = TripPurpose.Business,
  Personal = TripPurpose.Personal,
}

export type TripPurposeToggleProps = {
  selected: TripPurposeFilterValue
  onChange: (value: TripPurposeFilterValue) => void
  size?: ToggleSize
}

export const TripPurposeToggle = ({
  selected,
  onChange,
  size = ToggleSize.small,
}: TripPurposeToggleProps) => {
  const options = useMemo(() => [
    { label: 'All', value: TripPurposeFilterValue.All },
    { label: 'Business', value: TripPurposeFilterValue.Business },
    { label: 'Personal', value: TripPurposeFilterValue.Personal },
  ], [])

  return (
    <Toggle
      ariaLabel='Select trip purpose'
      options={options}
      selectedKey={selected}
      onSelectionChange={key => onChange(key as TripPurposeFilterValue)}
      size={size}
    />
  )
}
