import { useCallback, useId } from 'react'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { TripPurpose } from '@schemas/trip'
import { getPurposeLabel } from '@components/TripsTable/utils'
import classNames from 'classnames'
import './tripPurposeComboBox.scss'

type TripPurposeOption = {
  label: string
  value: TripPurpose
}

const TripPurposeOptionConfig = {
  [TripPurpose.Business]: { label: getPurposeLabel(TripPurpose.Business), value: TripPurpose.Business },
  [TripPurpose.Personal]: { label: getPurposeLabel(TripPurpose.Personal), value: TripPurpose.Personal },
  [TripPurpose.Unreviewed]: { label: getPurposeLabel(TripPurpose.Unreviewed), value: TripPurpose.Unreviewed },
}

const options = Object.values(TripPurposeOptionConfig)

type TripPurposeComboBoxProps = {
  value: TripPurpose | null
  onValueChange: (value: TripPurpose | null) => void
  isReadOnly?: boolean
  className?: string
}

export const TripPurposeComboBox = ({ value, onValueChange, isReadOnly, className }: TripPurposeComboBoxProps) => {
  const combinedClassName = classNames(
    'Layer__TripPurposeComboBox',
    'Layer__TripPurposeComboBox--inline',
    className,
  )

  const selectedOption = value ? TripPurposeOptionConfig[value] : null
  const onSelectedValueChange = useCallback((option: TripPurposeOption | null) => {
    onValueChange(option?.value || null)
  }, [onValueChange])

  const inputId = useId()

  return (
    <HStack className={combinedClassName}>
      <Label size='sm' htmlFor={inputId}>
        Purpose
      </Label>
      <ComboBox
        options={options}
        onSelectedValueChange={onSelectedValueChange}
        selectedValue={selectedOption}
        isSearchable={false}
        inputId={inputId}
        isReadOnly={isReadOnly}
        isClearable={false}
      />
    </HStack>
  )
}
