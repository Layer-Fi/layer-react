import { useCallback, useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { TripPurpose } from '@schemas/trip'
import { translationKey } from '@utils/i18n/translationKey'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { formFieldLayoutProps } from '@blocks/forms/FormFieldShell'

type TripPurposeOption = {
  label: string
  value: TripPurpose
}

const TRIP_PURPOSE_OPTIONS = [
  { value: TripPurpose.Business, ...translationKey('common:label.business', 'Business') },
  { value: TripPurpose.Personal, ...translationKey('common:label.personal', 'Personal') },
  { value: TripPurpose.Unreviewed, ...translationKey('common:state.unreviewed', 'Unreviewed') },
]

type TripPurposeComboBoxProps = {
  value: TripPurpose | null
  onValueChange: (value: TripPurpose | null) => void
  isReadOnly?: boolean
  inline?: boolean
  className?: string
}

export const TripPurposeComboBox = ({ value, onValueChange, isReadOnly, inline, className }: TripPurposeComboBoxProps) => {
  const { t } = useTranslation()
  const layoutProps = formFieldLayoutProps({ className, inline })

  const options = useMemo<TripPurposeOption[]>(
    () => TRIP_PURPOSE_OPTIONS.map(opt => ({
      value: opt.value,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )

  const selectedOption = value ? (options.find(o => o.value === value) ?? null) : null
  const handleChange = (option: null | TripPurposeOption) => {
    onValueChange(option?.value || null)
  }
  const onSelectedValueChange = useCallback(handleChange, [onValueChange])

  const inputId = useId()

  return (
    <HStack {...layoutProps}>
      <Label slot='label' size='sm' htmlFor={inputId}>
        {t('common:label.purpose', 'Purpose')}
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
