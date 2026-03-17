import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type BaseSelectOption } from '@internal-types/general'
import { getUsStateOptions, type USState } from '@internal-types/location'
import { Select } from '@components/Input/Select'

export const findSelectOption = (options: BaseSelectOption[], selected?: string) => {
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
  const usStateOptions: BaseSelectOption[] = useMemo(
    () => getUsStateOptions(t),
    [t],
  )

  return (
    <Select
      options={usStateOptions}
      value={findSelectOption(usStateOptions, value)}
      onChange={option => onChange(option as USState)}
      placeholder={t('usStates:label.us_state', 'US state')}
    />
  )
}
