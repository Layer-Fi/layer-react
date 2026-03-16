import { useCallback, useId, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { TripPurpose } from '@schemas/trip'
import { translationKey } from '@utils/i18n/translationKey'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { HStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'

import './tripPurposeComboBox.scss'

type TripPurposeOption = {
  label: string
  value: TripPurpose
}

const TRIP_PURPOSE_OPTIONS = [
  { value: TripPurpose.Business, ...translationKey('common.business', 'Business') },
  { value: TripPurpose.Personal, ...translationKey('common.personal', 'Personal') },
  { value: TripPurpose.Unreviewed, ...translationKey('common.unreviewed', 'Unreviewed') },
]

type TripPurposeComboBoxProps = {
  value: TripPurpose | null
  onValueChange: (value: TripPurpose | null) => void
  isReadOnly?: boolean
  className?: string
}

export const TripPurposeComboBox = ({ value, onValueChange, isReadOnly, className }: TripPurposeComboBoxProps) => {
  const { t } = useTranslation()
  const combinedClassName = classNames(
    'Layer__TripPurposeComboBox',
    'Layer__TripPurposeComboBox--inline',
    className,
  )

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
    <HStack className={combinedClassName}>
      <Label size='sm' htmlFor={inputId}>
        {t('common.purpose', 'Purpose')}
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
