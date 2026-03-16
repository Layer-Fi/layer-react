import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { US_STATES_CONFIG, type USState, type USStateCode, type USStateConfigRow } from '@internal-types/location'
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
  const { t } = useTranslation()
  const combinedClassName = classNames(
    'Layer__UsStateComboBox',
    inline && 'Layer__UsStateComboBox--inline',
    className,
  )

  const options = useMemo<USState[]>(
    () => (US_STATES_CONFIG as readonly USStateConfigRow[]).map(s => ({
      value: s.value,
      label: t(s.i18nKey, s.defaultValue),
    })),
    [t],
  )

  const selectedValue = value ? (options.find(o => o.value === value) ?? null) : null

  const handleChange = useCallback((option: USState | null) => {
    onChange(option?.value ?? null)
  }, [onChange])

  const inputId = useId()

  return (
    <HStack className={combinedClassName}>
      <Label size='sm' htmlFor={inputId}>
        {t('usStates.usState', 'US state')}
      </Label>
      <ComboBox<USState>
        options={options}
        selectedValue={selectedValue}
        onSelectedValueChange={handleChange}
        inputId={inputId}
        isClearable
        isReadOnly={isReadOnly}
      />
    </HStack>
  )
}
