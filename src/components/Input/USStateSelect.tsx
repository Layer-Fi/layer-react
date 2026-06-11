import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type BaseSelectOption } from '@internal-types/general'
import { getUsStateOptions, type USState } from '@internal-types/location'
import { ComboBox } from '@ui/ComboBox/ComboBox'

export const findSelectOption = <T extends BaseSelectOption>(options: ReadonlyArray<T>, selected?: string) => {
  if (!selected) {
    return undefined
  }

  return options.find(o =>
    String(o.value).toLowerCase() === String(selected).toLowerCase()
    || String(o.label).toLowerCase() === String(selected).toLowerCase(),
  )
}

export type USStateSelecttProps = {
  value?: string
  onChange: (value: USState) => void
}

export const USStateSelect = ({ value, onChange }: USStateSelecttProps) => {
  const { t } = useTranslation()
  const usStateOptions: USState[] = useMemo(
    () => getUsStateOptions(t),
    [t],
  )

  const handleChange = useCallback((option: USState | null) => {
    if (option) {
      onChange(option)
    }
  }, [onChange])

  return (
    <ComboBox
      options={usStateOptions}
      selectedValue={findSelectOption(usStateOptions, value) ?? null}
      onSelectedValueChange={handleChange}
      isClearable={false}
      placeholder={t('usStates:label.us_state', 'US state')}
    />
  )
}
