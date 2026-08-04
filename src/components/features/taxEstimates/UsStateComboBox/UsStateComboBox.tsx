import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { US_STATES_CONFIG, type USState, type USStateCode, type USStateConfigRow } from '@internal-types/location'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { ComboBoxField } from '@blocks/Form/ComboBoxField'

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

  return (
    <ComboBoxField label={t('usStates:label.us_state', 'US state')} className={className} inline={inline}>
      {controlProps => (
        <ComboBox<USState>
          {...controlProps}
          options={options}
          selectedValue={selectedValue}
          onSelectedValueChange={handleChange}
          isClearable
          isReadOnly={isReadOnly}
        />
      )}
    </ComboBoxField>
  )
}
