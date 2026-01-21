import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'

import { US_STATES, type USState, type USStateCode } from '@internal-types/location'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

import './usStateComboBox.scss'

type UsStateComboBoxProps = {
  value: USStateCode | null
  onChange: (value: USStateCode | null) => void
  isReadOnly?: boolean
  className?: string
  inline?: boolean
}

export const UsStateComboBox = ({
  value,
  onChange,
  isReadOnly,
  className,
  inline,
}: UsStateComboBoxProps) => {
  const combinedClassName = classNames(
    'Layer__UsStateComboBox',
    inline && 'Layer__UsStateComboBox--inline',
    className,
  )

  const selectedValue = useMemo(() =>
    value
      ? US_STATES.find(o => o.value === value) ?? null
      : null,
  [value])

  const handleChange = useCallback((option: USState | null) => {
    onChange(option?.value ?? null)
  }, [onChange])

  const inputId = useId()

  return (
    <HStack className={combinedClassName}>
      <Label size='sm' htmlFor={inputId}>
        US state
      </Label>
      <ComboBox<USState>
        options={US_STATES}
        selectedValue={selectedValue}
        onSelectedValueChange={handleChange}
        inputId={inputId}
        isClearable
        isReadOnly={isReadOnly}
      />
    </HStack>
  )
}
